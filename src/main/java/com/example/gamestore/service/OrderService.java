package com.example.gamestore.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.gamestore.dto.OrderItemRequest;
import com.example.gamestore.dto.OrderItemResponse;
import com.example.gamestore.dto.OrderRequest;
import com.example.gamestore.dto.OrderResponse;
import com.example.gamestore.model.Game;
import com.example.gamestore.model.Order;
import com.example.gamestore.model.OrderItem;
import com.example.gamestore.model.User;
import com.example.gamestore.repository.GameRepository;
import com.example.gamestore.repository.OrderRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final GameRepository gameRepository;
    private final GameKeyService gameKeyService;
    private final UserService userService;

    public OrderService(OrderRepository orderRepository, GameRepository gameRepository,
                        GameKeyService gameKeyService, UserService userService) {
        this.orderRepository = orderRepository;
        this.gameRepository = gameRepository;
        this.gameKeyService = gameKeyService;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listOrders(int skip, int limit, String username, boolean isAdmin, boolean mineOnly) {
        int page = skip / Math.max(limit, 1);
        PageRequest pageable = PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "id"));
        if (isAdmin && !mineOnly) {
            return orderRepository.findAll(pageable).stream().map(this::toResponse).toList();
        }
        User user = userService.findByUsername(username);
        return orderRepository.findForUser(user.getId(), user.getEmail(), pageable)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long id, String username, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (isAdmin || canAccess(order, username)) {
            return toResponse(order);
        }
        throw new AccessDeniedException("Немає доступу до замовлення");
    }

    @Transactional(readOnly = true)
    public void assertCanPay(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (!canAccess(order, username)) {
            throw new AccessDeniedException("Оплатити може лише покупець цього замовлення");
        }
        if (!"pending_payment".equals(order.getStatus())) {
            throw new IllegalArgumentException("Замовлення вже оплачене або недоступне для оплати");
        }
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request, String username) {
        if (username == null) {
            throw new AccessDeniedException("Увійдіть, щоб оформити замовлення");
        }
        Order order = new Order();
        order.setCustomerName(request.customerName());
        order.setCustomerEmail(request.customerEmail());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("pending_payment");

        User user = userService.findByUsername(username);
        order.setUserId(user.getId());
        order.setCustomerEmail(user.getEmail());

        List<OrderItem> items = new ArrayList<>();
        for (OrderItemRequest ir : request.items()) {
            Game game = gameRepository.findById(ir.gameId())
                    .orElseThrow(() -> new EntityNotFoundException("Game " + ir.gameId() + " not found"));
            if (Boolean.FALSE.equals(game.getIsActive()) || game.getStock() < ir.quantity()) {
                throw new IllegalArgumentException("Гра недоступна в потрібній кількості");
            }
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setGame(game);
            oi.setQuantity(ir.quantity());
            oi.setUnitPrice(game.getPrice());
            items.add(oi);
        }
        order.setItems(items);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse completePayment(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if ("paid".equals(order.getStatus())) return toResponse(order);
        if (!"pending_payment".equals(order.getStatus())) {
            throw new IllegalArgumentException("Замовлення не можна оплатити");
        }
        for (OrderItem item : order.getItems()) {
            Game game = item.getGame();
            if (game.getStock() < item.getQuantity()) {
                order.setStatus("failed");
                orderRepository.save(order);
                throw new IllegalArgumentException("Недостатньо товару: " + game.getTitle());
            }
            game.setStock(game.getStock() - item.getQuantity());
            gameKeyService.assignKeys(item, item.getQuantity());
        }
        order.setStatus("paid");
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public void deleteOrder(Long id, String username, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (!isAdmin && !canAccess(order, username)) {
            throw new AccessDeniedException("Можна видалити лише власні замовлення");
        }
        if ("paid".equals(order.getStatus())) {
            for (OrderItem item : order.getItems()) {
                gameKeyService.releaseKeys(item);
                Game game = item.getGame();
                game.setStock(game.getStock() + item.getQuantity());
            }
        }
        orderRepository.delete(order);
    }

    @Transactional
    public OrderResponse failPayment(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if ("pending_payment".equals(order.getStatus())) {
            order.setStatus("failed");
            orderRepository.save(order);
        }
        return toResponse(order);
    }

    private boolean canAccess(Order order, String username) {
        if (username == null) {
            return false;
        }
        User user = userService.findByUsername(username);
        if (order.getUserId() != null) {
            return order.getUserId().equals(user.getId());
        }
        return order.getCustomerEmail() != null
                && order.getCustomerEmail().equalsIgnoreCase(user.getEmail());
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(i.getId(), i.getGame().getId(), i.getQuantity(), i.getUnitPrice(),
                        "paid".equals(order.getStatus()) ? gameKeyService.getKeysForOrderItem(i.getId()) : List.of()))
                .toList();
        return new OrderResponse(order.getId(), order.getCustomerName(), order.getCustomerEmail(),
                order.getCreatedAt(), order.getStatus(), items);
    }
}

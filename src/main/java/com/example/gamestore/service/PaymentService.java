package com.example.gamestore.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.gamestore.dto.OrderResponse;
import com.example.gamestore.dto.PaymentSandboxRequest;
import com.example.gamestore.dto.PaymentSandboxResponse;

@Service
public class PaymentService {

    private static final String TEST_CARD = "4242424242424242";
    private final OrderService orderService;

    public PaymentService(OrderService orderService) {
        this.orderService = orderService;
    }

    @Transactional
    public PaymentSandboxResponse pay(PaymentSandboxRequest request, String username) {
        orderService.assertCanPay(request.orderId(), username);
        String card = request.cardNumber().replaceAll("\\s+", "");
        if (!TEST_CARD.equals(card)) {
            OrderResponse failed = orderService.failPayment(request.orderId());
            return new PaymentSandboxResponse(false, "Відхилено. Тестова картка: 4242 4242 4242 4242", failed);
        }
        OrderResponse paid = orderService.completePayment(request.orderId());
        return new PaymentSandboxResponse(true, "Оплата успішна! Ключі доставлено.", paid);
    }
}

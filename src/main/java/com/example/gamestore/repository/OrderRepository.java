package com.example.gamestore.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.gamestore.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
            SELECT o FROM Order o
            WHERE o.userId = :userId
               OR (o.userId IS NULL AND LOWER(o.customerEmail) = LOWER(:email))
            """)
    Page<Order> findForUser(@Param("userId") Long userId, @Param("email") String email, Pageable pageable);
}

package com.example.gamestore.controller;

import com.example.gamestore.dto.AuthResponse;
import com.example.gamestore.dto.LoginRequest;
import com.example.gamestore.dto.RegisterRequest;
import com.example.gamestore.model.User;
import com.example.gamestore.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Base64;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        
        String token = generateBasicAuthToken(request.username(), request.password());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userService.findByUsername(request.username());
        String token = generateBasicAuthToken(request.username(), request.password());

        return ResponseEntity.ok(
                new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole())
        );
    }

    private String generateBasicAuthToken(String username, String password) {
        String credentials = username + ":" + password;
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());
    }
}


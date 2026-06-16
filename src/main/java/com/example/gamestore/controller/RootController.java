package com.example.gamestore.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RootController {

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of("message", "KeyGames API is running");
    }
}


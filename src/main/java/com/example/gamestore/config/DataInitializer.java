package com.example.gamestore.config;

import com.example.gamestore.model.Role;
import com.example.gamestore.model.User;
import com.example.gamestore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@gamestore.com");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Admin user created: username=admin, password=admin123");
        }

        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setEmail("user@gamestore.com");
            user.setRole(Role.USER);
            userRepository.save(user);
            System.out.println("Test user created: username=user, password=user123");
        }
    }
}


package GourmetCommunity.config;

import GourmetCommunity.auth.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .headers(headers ->
                        headers.frameOptions(frameOptions -> frameOptions.sameOrigin())
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) ->
                                sendErrorResponse(
                                        response,
                                        HttpStatus.UNAUTHORIZED,
                                        "인증이 필요합니다."
                                )
                        )
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                sendErrorResponse(
                                        response,
                                        HttpStatus.FORBIDDEN,
                                        "접근 권한이 없습니다."
                                )
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/favicon.ico", "/error").permitAll()

                        .requestMatchers(HttpMethod.POST, "/users/signup").permitAll()
                        .requestMatchers(HttpMethod.POST, "/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/users/token/refresh").permitAll()
                        .requestMatchers(HttpMethod.POST, "/users/logout").permitAll()
                        .requestMatchers(HttpMethod.GET, "/posts/search").authenticated()

                        .requestMatchers(HttpMethod.GET, "/posts").permitAll()
                        .requestMatchers(HttpMethod.GET, "/posts/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/posts/*/comments").permitAll()
                        .requestMatchers(HttpMethod.GET, "/posts/*/comments/*").permitAll()

                        .requestMatchers(HttpMethod.GET, "/users").authenticated()
                        .requestMatchers(HttpMethod.GET, "/users/*").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/users/*").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/users/*/password").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/users/*").authenticated()

                        .requestMatchers(HttpMethod.POST, "/users/*/posts").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/posts/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/posts/*").authenticated()

                        .requestMatchers(HttpMethod.POST, "/posts/*/comments").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/posts/*/comments/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/posts/*/comments/*").authenticated()

                        .requestMatchers(HttpMethod.GET, "/posts/*/likes/users/*").authenticated()
                        .requestMatchers(HttpMethod.POST, "/posts/*/likes/users/*").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }

    private void sendErrorResponse(
            HttpServletResponse response,
            HttpStatus status,
            String message
    ) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("message", message);
        body.put("error", status.name());

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
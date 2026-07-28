package GourmetCommunity.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtProvider {
    private final JwtProperties jwtProperties;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(
                jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    private String createToken(
            String type,
            Long userId,
            Map<String, Object> claims,
            long expSeconds
    ) {
        Instant now = Instant.now();

        JwtBuilder builder = Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("typ", type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expSeconds)));

        if (claims != null) {
            claims.forEach(builder::claim);
        }

        return builder
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String createAccessToken(Long userId, String email, String nickname) {
        return createToken(
                "access",
                userId,
                Map.of(
                        "email", email,
                        "nickname", nickname
                ),
                jwtProperties.getAccessTokenExpSeconds()
        );
    }

    public String createRefreshToken(Long userId) {
        return createToken(
                "refresh",
                userId,
                Map.of(),
                jwtProperties.getRefreshTokenExpSeconds()
        );
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }

    public String getTokenType(String token) {
        return parse(token)
                .getPayload()
                .get("typ", String.class);
    }

    public boolean isAccessToken(String token) {
        return "access".equals(getTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(getTokenType(token));
    }

    public Long getUserId(String token) {
        String subject = parse(token)
                .getPayload()
                .getSubject();

        return Long.valueOf(subject);
    }

    public long getAccessTokenValidityInMilliseconds() {
        return jwtProperties.getAccessTokenExpSeconds() * 1000;
    }

    public long getRefreshTokenValidityInSeconds() {
        return jwtProperties.getRefreshTokenExpSeconds();
    }

    public LocalDateTime getRefreshTokenExpiresAt() {
        return LocalDateTime.now()
                .plusSeconds(jwtProperties.getRefreshTokenExpSeconds());
    }
}

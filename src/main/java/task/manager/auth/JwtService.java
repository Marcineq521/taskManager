package task.manager.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final String SECREY_KEY="56423koln54njlkgfdsdgflml543ngfdsdfaasfd2435";

    private SecretKey getKey(){
        return Keys.hmacShaKeyFor(
                SECREY_KEY.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String username){
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+1000*60*60)) //token wazny godzine
                .signWith(getKey())
                .compact();
    }

    public String extractUsername(String token){
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token){
        try{
            getClaims(token);
            return true;
        } catch (Exception e){
            return false;
        }
    }

    private Claims getClaims(String token){
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }
}

package task.manager.auth;


import io.jsonwebtoken.Jwt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import task.manager.user.User;
import task.manager.auth.JwtService;
import task.manager.user.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request){
         User user=new User();

         user.setUsername(request.getUsername());
         user.setPassword(passwordEncoder.encode(request.getPassword()));

         if(userRepository.findByUsername(request.getUsername()).isPresent()){
             throw new RuntimeException("Username already exists");
         }

         userRepository.save(user);
         return "User created";
     }

     @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request){
        User user= userRepository.findByUsername(request.getUsername()).orElseThrow(()->new RuntimeException("User not found"));
        boolean passwordMatches= passwordEncoder.matches(request.getPassword(),user.getPassword());

        if(!passwordMatches){
            throw new RuntimeException("Wrong password");
        }

        String token= jwtService.generateToken(user.getUsername());
        return new LoginResponse(token);
     }
}

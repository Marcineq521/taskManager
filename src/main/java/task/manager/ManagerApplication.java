package task.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class ManagerApplication {

	public static void main(String[] args) {

		System.out.println(new BCryptPasswordEncoder().encode("admin"));
		SpringApplication.run(ManagerApplication.class, args);
	}

}

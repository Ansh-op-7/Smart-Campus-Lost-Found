package com.findit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findit.dto.claim.CreateClaimRequest;
import com.findit.dto.claim.UpdateClaimStatusRequest;
import com.findit.entity.Category;
import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.repository.CategoryRepository;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import com.findit.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ClaimControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private com.findit.repository.NotificationRepository notificationRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private User reporter;
    private User claimant;
    private User stranger;
    private User admin;
    private Category category;
    private Item foundItem;

    private String reporterToken;
    private String claimantToken;
    private String strangerToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        claimRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();

        reporter = userRepository.saveAndFlush(new User("Reporter", "reporter@test.edu", "pass", "111", Role.STUDENT));
        claimant = userRepository.saveAndFlush(new User("Claimant", "claimant@test.edu", "pass", "222", Role.STUDENT));
        stranger = userRepository.saveAndFlush(new User("Stranger", "stranger@test.edu", "pass", "333", Role.STUDENT));
        admin = userRepository.saveAndFlush(new User("Admin", "admin@test.edu", "pass", "000", Role.ADMIN));

        reporterToken = jwtService.generateToken(reporter);
        claimantToken = jwtService.generateToken(claimant);
        strangerToken = jwtService.generateToken(stranger);
        adminToken = jwtService.generateToken(admin);

        category = categoryRepository.findByName("Wallet")
                .orElseGet(() -> categoryRepository.saveAndFlush(new Category("Wallet", "Wallets")));

        foundItem = itemRepository.saveAndFlush(new Item("Found Blue Wallet", "Found at library",
                ItemType.FOUND, "Library", null, LocalDateTime.now(), ItemStatus.ACTIVE, reporter, category));
    }

    @Test
    void testCreateClaim_Success() throws Exception {
        CreateClaimRequest request = new CreateClaimRequest(foundItem.getId(), "This is my blue wallet with student ID.");

        mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + claimantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.claimant.email").value("claimant@test.edu"))
                .andExpect(jsonPath("$.item.id").value(foundItem.getId()));

        assertThat(claimRepository.count()).isEqualTo(1);
    }

    @Test
    void testReporterCanViewReceivedClaims() throws Exception {
        claimRepository.saveAndFlush(new Claim("Proof 1", ClaimStatus.PENDING, foundItem, claimant));

        mockMvc.perform(get("/api/claims/received")
                        .header("Authorization", "Bearer " + reporterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].claimant.name").value("Claimant"));
    }

    @Test
    void testClaimantCanViewMyClaims() throws Exception {
        claimRepository.saveAndFlush(new Claim("Proof 1", ClaimStatus.PENDING, foundItem, claimant));

        mockMvc.perform(get("/api/claims/my")
                        .header("Authorization", "Bearer " + claimantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].item.title").value("Found Blue Wallet"));
    }

    @Test
    void testApproveClaimFlow_AndItemBecomesClaimed() throws Exception {
        Claim claim = claimRepository.saveAndFlush(new Claim("Proof 1", ClaimStatus.PENDING, foundItem, claimant));

        UpdateClaimStatusRequest request = new UpdateClaimStatusRequest(ClaimStatus.APPROVED);

        mockMvc.perform(put("/api/claims/" + claim.getId() + "/status")
                        .header("Authorization", "Bearer " + reporterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.item.status").value("CLAIMED"));

        Item updatedItem = itemRepository.findById(foundItem.getId()).orElseThrow();
        assertThat(updatedItem.getStatus()).isEqualTo(ItemStatus.CLAIMED);
    }

    @Test
    void testCompleteClaimFlow_AndItemBecomesReturned() throws Exception {
        foundItem.setStatus(ItemStatus.CLAIMED);
        itemRepository.saveAndFlush(foundItem);

        Claim claim = claimRepository.saveAndFlush(new Claim("Proof 1", ClaimStatus.APPROVED, foundItem, claimant));

        mockMvc.perform(put("/api/claims/" + claim.getId() + "/complete")
                        .header("Authorization", "Bearer " + claimantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.item.status").value("RETURNED"));

        Item updatedItem = itemRepository.findById(foundItem.getId()).orElseThrow();
        assertThat(updatedItem.getStatus()).isEqualTo(ItemStatus.RETURNED);
    }

    @Test
    void testStrangerCannotApproveClaim() throws Exception {
        Claim claim = claimRepository.saveAndFlush(new Claim("Proof 1", ClaimStatus.PENDING, foundItem, claimant));

        UpdateClaimStatusRequest request = new UpdateClaimStatusRequest(ClaimStatus.APPROVED);

        mockMvc.perform(put("/api/claims/" + claim.getId() + "/status")
                        .header("Authorization", "Bearer " + strangerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}

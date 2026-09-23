package com.findit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findit.entity.Notification;
import com.findit.entity.NotificationType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.NotificationRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NotificationControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private User user1;
    private User user2;
    private String user1Token;
    private String user2Token;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        claimRepository.deleteAll();
        itemRepository.deleteAll();
        userRepository.deleteAll();

        user1 = userRepository.saveAndFlush(new User("User One", "user1@test.edu", "pass", "111", Role.STUDENT));
        user2 = userRepository.saveAndFlush(new User("User Two", "user2@test.edu", "pass", "222", Role.STUDENT));

        user1Token = jwtService.generateToken(user1);
        user2Token = jwtService.generateToken(user2);
    }

    @Test
    void testGetMyNotifications() throws Exception {
        Notification n1 = new Notification("New Claim", "You have a new claim", NotificationType.NEW_CLAIM, user1);
        Notification n2 = new Notification("Claim Approved", "Your claim was approved", NotificationType.CLAIM_APPROVED, user1);
        Notification n3 = new Notification("Other User Notification", "For user 2", NotificationType.NEW_CLAIM, user2);

        notificationRepository.saveAndFlush(n1);
        notificationRepository.saveAndFlush(n2);
        notificationRepository.saveAndFlush(n3);

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[0].type").exists());
    }

    @Test
    void testGetUnreadCount() throws Exception {
        Notification n1 = new Notification("N1", "Msg1", NotificationType.NEW_CLAIM, user1);
        n1.setRead(false);
        Notification n2 = new Notification("N2", "Msg2", NotificationType.CLAIM_APPROVED, user1);
        n2.setRead(true);
        Notification n3 = new Notification("N3", "Msg3", NotificationType.ITEM_RETURNED, user1);
        n3.setRead(false);

        notificationRepository.saveAndFlush(n1);
        notificationRepository.saveAndFlush(n2);
        notificationRepository.saveAndFlush(n3);

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    void testMarkAsRead_Success() throws Exception {
        Notification n = new Notification("New Claim", "You have a new claim", NotificationType.NEW_CLAIM, user1);
        n.setRead(false);
        n = notificationRepository.saveAndFlush(n);

        mockMvc.perform(put("/api/notifications/" + n.getId() + "/read")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));

        Notification updated = notificationRepository.findById(n.getId()).orElseThrow();
        assertThat(updated.isRead()).isTrue();
    }

    @Test
    void testMarkAsRead_ForbiddenForOtherUser() throws Exception {
        Notification n = new Notification("User1 Notif", "Message", NotificationType.NEW_CLAIM, user1);
        n = notificationRepository.saveAndFlush(n);

        mockMvc.perform(put("/api/notifications/" + n.getId() + "/read")
                        .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    void testMarkAllAsRead_Success() throws Exception {
        Notification n1 = new Notification("N1", "Msg1", NotificationType.NEW_CLAIM, user1);
        n1.setRead(false);
        Notification n2 = new Notification("N2", "Msg2", NotificationType.CLAIM_APPROVED, user1);
        n2.setRead(false);

        notificationRepository.saveAndFlush(n1);
        notificationRepository.saveAndFlush(n2);

        mockMvc.perform(put("/api/notifications/read-all")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("All notifications marked as read"));

        long unread = notificationRepository.countByUserIdAndIsReadFalse(user1.getId());
        assertThat(unread).isEqualTo(0L);
    }
}

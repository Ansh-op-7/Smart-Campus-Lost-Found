package com.findit.config;

import com.findit.entity.Category;
import com.findit.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        seedDefaultCategories();
    }

    private void seedDefaultCategories() {
        Map<String, String> defaultCategories = Map.of(
                "Electronics", "Laptops, phones, chargers, headphones, and electronic gadgets",
                "Documents", "ID cards, passports, notebooks, certificates, and academic papers",
                "Clothing", "Jackets, hoodies, caps, scarves, and sportswear",
                "Accessories", "Watches, jewelry, sunglasses, umbrellas, and bags",
                "Books", "Textbooks, library books, novels, and study guides",
                "Keys", "Dorm keys, bike locks, car key fobs, and locker keys",
                "Wallet", "Wallets, purses, coin pouches, and cardholders",
                "Other", "Miscellaneous items found or lost on campus"
        );

        for (Map.Entry<String, String> entry : defaultCategories.entrySet()) {
            if (!categoryRepository.existsByName(entry.getKey())) {
                Category category = new Category(entry.getKey(), entry.getValue());
                categoryRepository.save(category);
            }
        }
    }
}

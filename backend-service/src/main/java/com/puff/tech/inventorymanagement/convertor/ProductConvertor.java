package com.puff.tech.inventorymanagement.convertor;

import com.puff.tech.inventorymanagement.repository.CategoriesEntity;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.usecase.product.add.AddProductUCRequest;
import com.puff.tech.onboarding.repository.MemberEntity;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class ProductConvertor {
    private ProductConvertor() {
    }

    public static ProductEntity toRequest(AddProductUCRequest request, Long memberId, String userId, CategoriesEntity categories) {
        ProductEntity productEntity = new ProductEntity();
        if (memberId != null) {
            MemberEntity memberEntity = new MemberEntity();
            memberEntity.setId(memberId);
            productEntity.setMember(memberEntity);
        }
        productEntity.setCategory(categories);
        productEntity.setName(request.name());
        if (request.perUnitPurchasePrice() != null && request.perUnitPurchasePrice().compareTo(BigDecimal.ZERO) > 0) {
            productEntity.setPerUnitPurchasePrice(request.perUnitPurchasePrice());
            if (request.itemCount() != null && request.itemCount() > 0) {
                productEntity.setGrossPurchasePrice(
                        BigDecimal.valueOf(request.itemCount()).multiply(request.perUnitPurchasePrice())
                );
            } else {
                productEntity.setGrossPurchasePrice(null);
            }
        } else if (request.grossPurchasePrice() != null) {
            productEntity.setGrossPurchasePrice(request.grossPurchasePrice());
            if (request.itemCount() != null && request.itemCount() > 0) {
                BigDecimal perUnitPrice = request.grossPurchasePrice().divide(
                        BigDecimal.valueOf(request.itemCount()),
                        4, // Scale: 4 decimal places for pricing precision
                        RoundingMode.HALF_UP
                );
                productEntity.setPerUnitPurchasePrice(perUnitPrice);
            } else {
                productEntity.setPerUnitPurchasePrice(null);
            }
        } else {
            // Optional fallback if both are missing/zero
            productEntity.setPerUnitPurchasePrice(null);
            productEntity.setGrossPurchasePrice(null);
        }
        productEntity.setItemCount(request.itemCount());
        productEntity.setUnit(request.unit());
        productEntity.setLowStockAlert(request.lowStockAlert());
        productEntity.setCreatedBy(userId);
        productEntity.setUpdatedBy(userId);
        productEntity.setFixedSellingPrice(request.fixedSellingPrice());
        productEntity.setVatPercentage(request.vatPercentage());
        productEntity.setTaxPercentage(request.isTaxIncluded() ? request.taxPercentage() : 0);
        productEntity.setTaxIncluded(request.isTaxIncluded());
        productEntity.setImageUrl(request.imageUrl());

        return productEntity;

    }
}

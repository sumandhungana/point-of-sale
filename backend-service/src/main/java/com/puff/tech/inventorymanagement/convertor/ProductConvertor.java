package com.puff.tech.inventorymanagement.convertor;

import com.puff.tech.inventorymanagement.repository.CategoriesEntity;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.usecase.product.add.AddProductUCRequest;
import com.puff.tech.inventorymanagement.usecase.product.edit.EditProductUCRequest;
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
    public static ProductEntity updateEntity(ProductEntity entity,
                                             EditProductUCRequest request,
                                             Long memberId,
                                             String userId,
                                             CategoriesEntity category) {

        if (memberId != null) {
            MemberEntity memberEntity = new MemberEntity();
            memberEntity.setId(memberId);
            entity.setMember(memberEntity);
        }

        if (category != null) {
            entity.setCategory(category);
        }

        if (request.name() != null) {
            entity.setName(request.name());
        }

        if (request.unit() != null) {
            entity.setUnit(request.unit());
        }

        if (request.lowStockAlert() != null) {
            entity.setLowStockAlert(request.lowStockAlert());
        }

        if (request.fixedSellingPrice() != null) {
            entity.setFixedSellingPrice(request.fixedSellingPrice());
        }

        if (request.vatPercentage() != null) {
            entity.setVatPercentage(request.vatPercentage());
        }

        if (request.isTaxIncluded() != null) {
            entity.setTaxIncluded(request.isTaxIncluded());
            if (request.taxPercentage() != null) {
                entity.setTaxPercentage(request.isTaxIncluded() ? request.taxPercentage() : 0);
            }
        } else if (request.taxPercentage() != null) {
            entity.setTaxPercentage(request.taxPercentage());
        }

        if (request.imageUrl() != null) {
            entity.setImageUrl(request.imageUrl());
        }

        // Determine effective item count (new value or retain existing)
        int effectiveItemCount = request.itemCount() != null ? Integer.parseInt(String.valueOf(request.itemCount())) : Integer.parseInt(String.valueOf(entity.getItemCount()));
        if (request.itemCount() != null) {
            entity.setItemCount(request.itemCount());
        }

        // Handle price updates conditionally
        if (request.perUnitPurchasePrice() != null && request.perUnitPurchasePrice().compareTo(BigDecimal.ZERO) > 0) {
            entity.setPerUnitPurchasePrice(request.perUnitPurchasePrice());
            if (effectiveItemCount > 0) {
                entity.setGrossPurchasePrice(
                        BigDecimal.valueOf(effectiveItemCount).multiply(request.perUnitPurchasePrice())
                );
            }
        } else if (request.grossPurchasePrice() != null) {
            entity.setGrossPurchasePrice(request.grossPurchasePrice());
            if (effectiveItemCount > 0) {
                BigDecimal perUnitPrice = request.grossPurchasePrice().divide(
                        BigDecimal.valueOf(effectiveItemCount),
                        4,
                        RoundingMode.HALF_UP
                );
                entity.setPerUnitPurchasePrice(perUnitPrice);
            }
        } else if (request.itemCount() != null && entity.getPerUnitPurchasePrice() != null) {
            // If only itemCount was updated, recalculate gross price using existing per-unit price
            if (effectiveItemCount > 0) {
                entity.setGrossPurchasePrice(
                        BigDecimal.valueOf(effectiveItemCount).multiply(entity.getPerUnitPurchasePrice())
                );
            }
        }

        // Update audit fields
        if (userId != null) {
            entity.setUpdatedBy(userId);
        }

        return entity;
    }
}

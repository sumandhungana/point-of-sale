package com.puff.tech.covertor;

import com.puff.tech.entity.IncomeEntity;
import com.puff.tech.entity.ItemEntity;
import com.puff.tech.usecase.item.create.CreateItemUseCaseRequest;
import com.puff.tech.usecase.item.get.GetItemUseCaseResponse;
import com.puff.tech.usecase.item.update.UpdateItemUseCaseRequest;

import java.io.IOException;
import java.util.Base64;

public class ItemConvertor {
    private ItemConvertor(){}

    public static ItemEntity toEntity(CreateItemUseCaseRequest request,
                                      Integer khataBookId){
        ItemEntity itemEntity= new ItemEntity();
        itemEntity.setName(request.name());
        itemEntity.setPrimaryUnit(request.primaryUnit());
        itemEntity.setSecondaryUnit(request.secondaryUnit());
        itemEntity.setSecondaryUnitEnabled(request.isSecondaryUnitEnabled());
        itemEntity.setCategoryId(request.categoryId());
        itemEntity.setSalesPrice(request.salesPrice());
        itemEntity.setPurchasePrice(request.purchasePrice());
        itemEntity.setTaxIncluded(request.taxIncluded());
        itemEntity.setOpeningStock(request.openingStock());
        itemEntity.setLowStockAlert(request.lowStockAlert());
        itemEntity.setVatPercentage(request.vatPercentage());
        itemEntity.setVatPercentageToday(request.vatPercentageToday());
        itemEntity.setVatDate(request.vatDate());
        try {
            itemEntity.setImageUrl(getImageBase64String(request.photoPath().getBytes()));
        }catch (Exception e){
            throw new IllegalArgumentException("Cannot convert to bytes");
        }
        return itemEntity;
    }

    private static String getImageBase64String(byte[] src) {
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetItemUseCaseResponse toResponse(ItemEntity itemEntity){
        return new GetItemUseCaseResponse(
                itemEntity.getId(),
                itemEntity.getName(),
                itemEntity.getPrimaryUnit(),
                itemEntity.getSecondaryUnit(),
                itemEntity.isSecondaryUnitEnabled(),
                itemEntity.getCategoryId(),
                itemEntity.getSalesPrice(),
                itemEntity.getPurchasePrice(),
                itemEntity.isTaxIncluded(),
                itemEntity.getOpeningStock(),
                itemEntity.getLowStockAlert(),
                itemEntity.getVatPercentage(),
                itemEntity.getVatPercentageToday(),
                itemEntity.getVatDate(),
                itemEntity.getImageUrl()

        );
    }

    public static ItemEntity toUpdateEntity(UpdateItemUseCaseRequest request,
                                            ItemEntity itemEntity){
        itemEntity.setId(request.id());
        itemEntity.setName(request.name());
        itemEntity.setPrimaryUnit(request.primaryUnit());
        itemEntity.setSecondaryUnit(request.secondaryUnit());
        itemEntity.setSecondaryUnitEnabled(request.isSecondaryUnitEnabled());
        itemEntity.setCategoryId(request.categoryId());
        itemEntity.setSalesPrice(request.salesPrice());
        itemEntity.setPurchasePrice(request.purchasePrice());
        itemEntity.setTaxIncluded(request.taxIncluded());
        itemEntity.setOpeningStock(request.openingStock());
        itemEntity.setLowStockAlert(request.lowStockAlert());
        itemEntity.setVatPercentage(request.vatPercentage());
        itemEntity.setVatPercentageToday(request.vatPercentageToday());
        itemEntity.setVatDate(request.vatDate());
        try {
            itemEntity.setImageUrl(getImageBase64String(request.photoPath().getBytes()));
        }catch (Exception e){
            throw new IllegalArgumentException("Cannot convert to bytes");
        }
        return itemEntity;
    }

    }



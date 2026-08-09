package com.puff.tech.covertor;


import com.puff.tech.entity.SalesBillItemEntity;
import com.puff.tech.usecase.salesbillitems.create.CreateSalesBillItemUseCaseRequest;
import com.puff.tech.usecase.salesbillitems.get.GetSalesBillItemUseCaseResponse;
import com.puff.tech.usecase.salesbillitems.update.UpdateSalesBillItemUseCaseRequest;


import java.math.BigDecimal;

public class SalesBillItemConvertor {
    private SalesBillItemConvertor(){}

    public static SalesBillItemEntity toEntity(CreateSalesBillItemUseCaseRequest request, Integer khataBookId) {

        SalesBillItemEntity salesBillItem = new SalesBillItemEntity();
        BigDecimal quantity = request.quantity() != null ? request.quantity() : BigDecimal.ZERO;
        BigDecimal unitPrice = request.unitPrice() != null ? request.unitPrice() : BigDecimal.ZERO;
        BigDecimal discount = request.discount() != null ? request.discount() : BigDecimal.ZERO;
        BigDecimal tax = request.tax() != null ? request.tax() : BigDecimal.ZERO;
        BigDecimal totalPrice = quantity.multiply(unitPrice);
        BigDecimal finalPrice = totalPrice.subtract(discount).add(tax);
        salesBillItem.setKhataBookId(khataBookId);
        salesBillItem.setSalesBillId(request.salesBillId());
        salesBillItem.setItemId(request.itemId());
        salesBillItem.setQuantity(quantity);
        salesBillItem.setUnitPrice(unitPrice);
        salesBillItem.setTotalPrice(totalPrice);
        salesBillItem.setDiscount(discount);
        salesBillItem.setTax(tax);
        salesBillItem.setFinalPrice(finalPrice);
        return salesBillItem;
    }

    public static void updateEntity(SalesBillItemEntity entity, UpdateSalesBillItemUseCaseRequest request) {

        BigDecimal quantity = request.quantity() != null ? request.quantity() : BigDecimal.ZERO;
        BigDecimal unitPrice = request.unitPrice() != null ? request.unitPrice() : BigDecimal.ZERO;
        BigDecimal discount = request.discount() != null ? request.discount() : BigDecimal.ZERO;
        BigDecimal tax = request.tax() != null ? request.tax() : BigDecimal.ZERO;
        BigDecimal totalPrice = quantity.multiply(unitPrice);
        BigDecimal finalPrice = totalPrice.subtract(discount).add(tax);
        entity.setQuantity(quantity);
        entity.setUnitPrice(unitPrice);
        entity.setTotalPrice(totalPrice);
        entity.setDiscount(discount);
        entity.setTax(tax);
        entity.setFinalPrice(finalPrice);
    }

    public static GetSalesBillItemUseCaseResponse toResponse(SalesBillItemEntity salesBillItem){
        return new GetSalesBillItemUseCaseResponse(
                salesBillItem.getId(),
                salesBillItem.getSalesBillId(),
                salesBillItem.getItemId(),
                salesBillItem.getQuantity(),
                salesBillItem.getUnitPrice(),
                salesBillItem.getTotalPrice(),
                salesBillItem.getDiscount(),
                salesBillItem.getTax(),
                salesBillItem.getFinalPrice(),
                salesBillItem.getCreatedAt(),
                salesBillItem.getUpdatedAt()
        );
    }

}

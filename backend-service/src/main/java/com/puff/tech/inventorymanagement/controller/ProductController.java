package com.puff.tech.inventorymanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.inventorymanagement.usecase.category.getAll.GetAllCategoriesUCRequest;
import com.puff.tech.inventorymanagement.usecase.category.getAll.GetAllCategoriesUCResponse;
import com.puff.tech.inventorymanagement.usecase.product.add.AddProductUC;
import com.puff.tech.inventorymanagement.usecase.product.add.AddProductUCRequest;
import com.puff.tech.inventorymanagement.usecase.product.add.AddProductUCResponse;
import com.puff.tech.inventorymanagement.usecase.product.edit.EditProductUC;
import com.puff.tech.inventorymanagement.usecase.product.edit.EditProductUCRequest;
import com.puff.tech.inventorymanagement.usecase.product.edit.EditProductUCResponse;
import com.puff.tech.inventorymanagement.usecase.product.get.GetAllProductUC;
import com.puff.tech.inventorymanagement.usecase.product.get.GetAllProductUCRequest;
import com.puff.tech.inventorymanagement.usecase.product.get.GetAllProductUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("/product")
public class ProductController {
    private final AddProductUC addProductUC;
    private final GetAllProductUC getAllProductUC;
    private final EditProductUC editProductUC;

    @Inject
    public ProductController(AddProductUC addProductUC,
                             GetAllProductUC getAllProductUC, EditProductUC editProductUC) {
        this.addProductUC = addProductUC;
        this.getAllProductUC = getAllProductUC;
        this.editProductUC = editProductUC;
    }

    @Secured(permissions = {Permission.INVENTORY_PRODUCT_ADD})
    @Post
    public Mono<RestResponse<AddProductUCResponse>> create(@Body AddProductUCRequest request){
        return addProductUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just( RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.INVENTORY_PRODUCT_UPDATE})
    @Put
    public Mono<RestResponse<EditProductUCResponse>> edit(@Body EditProductUCRequest request){
        return editProductUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just( RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.INVENTORY_PRODUCT_ALL})
    @Get("all-products")
    public Mono<RestResponse<GetAllProductUCResponse>> getProducts() {
        return getAllProductUC.execute(new GetAllProductUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }
}

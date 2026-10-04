package com.puff.tech.inventorymanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.inventorymanagement.usecase.category.add.AddCategoriesUC;
import com.puff.tech.inventorymanagement.usecase.category.add.AddCategoriesUCRequest;
import com.puff.tech.inventorymanagement.usecase.category.add.AddCategoriesUCResponse;
import com.puff.tech.inventorymanagement.usecase.category.getAll.GetAllCategoriesUC;
import com.puff.tech.inventorymanagement.usecase.category.getAll.GetAllCategoriesUCRequest;
import com.puff.tech.inventorymanagement.usecase.category.getAll.GetAllCategoriesUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("categories")
public class CategoryController {

    private final GetAllCategoriesUC getAllCategoriesUC;
    private final AddCategoriesUC addCategoriesUC;

    public CategoryController(GetAllCategoriesUC getAllCategoriesUC,
                              AddCategoriesUC addCategoriesUC) {
        this.getAllCategoriesUC = getAllCategoriesUC;
        this.addCategoriesUC = addCategoriesUC;
    }

    @Secured(permissions = {Permission.INVENTORY_CATEGORY_ADD})
    @Post()
    public Mono<RestResponse<AddCategoriesUCResponse>> post(@Body AddCategoriesUCRequest request) {
        return addCategoriesUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened while adding category:: " + err.getLocalizedMessage())));
    }


    @Secured(permissions = {Permission.INVENTORY_CATEGORY_ALL})
    @Get("all-categories")
    public Mono<RestResponse<List<GetAllCategoriesUCResponse>>> getCustomers() {
        return getAllCategoriesUC.execute(new GetAllCategoriesUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }
}

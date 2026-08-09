package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.category.create.CreateCategoryUseCase;
import com.puff.tech.usecase.category.create.CreateCategoryUseCaseRequest;
import com.puff.tech.usecase.category.create.CreateCategoryUseCaseResponse;
import com.puff.tech.usecase.category.delete.DeleteCategoryUseCase;
import com.puff.tech.usecase.category.delete.DeleteCategoryUseCaseResponse;
import com.puff.tech.usecase.category.get.GetCategoryUseCase;
import com.puff.tech.usecase.category.get.GetCategoryUseCaseResponse;
import com.puff.tech.usecase.category.getone.GetSingleCategoryUseCase;
import com.puff.tech.usecase.category.update.UpdateCategoryUseCase;
import com.puff.tech.usecase.category.update.UpdateCategoryUseCaseRequest;
import com.puff.tech.usecase.category.update.UpdateCategoryUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class CategoryController {

    private final CreateCategoryUseCase createCategoryUseCase;
    private final GetCategoryUseCase getCategoryUseCase;
    private final GetSingleCategoryUseCase getSingleCategoryUseCase;
    private final UpdateCategoryUseCase updateCategoryUseCase;
    private final DeleteCategoryUseCase deleteCategoryUseCase;

    @Inject
    public CategoryController(CreateCategoryUseCase createCategoryUseCase,
                              GetCategoryUseCase getCategoryUseCase,
                              GetSingleCategoryUseCase getSingleCategoryUseCase,
                              UpdateCategoryUseCase updateCategoryUseCase,
                              DeleteCategoryUseCase deleteCategoryUseCase) {
        this.createCategoryUseCase = createCategoryUseCase;
        this.getCategoryUseCase = getCategoryUseCase;
        this.getSingleCategoryUseCase = getSingleCategoryUseCase;
        this.updateCategoryUseCase = updateCategoryUseCase;
        this.deleteCategoryUseCase = deleteCategoryUseCase;
    }

    @Post("/category")
    public Mono<RestResponse<CreateCategoryUseCaseResponse>> create(@Body CreateCategoryUseCaseRequest request){
        return createCategoryUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/category")
    public Flux<RestResponse<GetCategoryUseCaseResponse>> get(){
        return getCategoryUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+ err.getLocalizedMessage())));
    }

    @Get("/category/{id}")
    public Mono<RestResponse<GetCategoryUseCaseResponse>> getSingle(@PathVariable Integer id){
        return getSingleCategoryUseCase.execute(id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Put("/category/{id}")
    public Mono<RestResponse<UpdateCategoryUseCaseResponse>> update(@Body UpdateCategoryUseCaseRequest request,
                                                                    @PathVariable Integer id){
        return updateCategoryUseCase.execute(request, id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));

    }

    @Delete("/category/{id}")
    public Mono<RestResponse<DeleteCategoryUseCaseResponse>> delete(@PathVariable Integer id){
        return deleteCategoryUseCase.execute(id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));

    }

}

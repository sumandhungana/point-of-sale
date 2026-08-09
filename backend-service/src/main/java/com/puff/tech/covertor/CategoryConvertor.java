package com.puff.tech.covertor;

import com.puff.tech.entity.CategoryEntity;
import com.puff.tech.usecase.category.create.CreateCategoryUseCaseRequest;
import com.puff.tech.usecase.category.get.GetCategoryUseCaseResponse;
import com.puff.tech.usecase.category.update.UpdateCategoryUseCaseRequest;
import com.puff.tech.usecase.category.update.UpdateCategoryUseCaseResponse;

import java.time.Instant;

public class CategoryConvertor {

    private CategoryConvertor(){}

    public static CategoryEntity toEntity(CreateCategoryUseCaseRequest request,Integer khataBookId){
        CategoryEntity categoryEntity=  new CategoryEntity();
        categoryEntity.setKhataBookId(khataBookId);
        categoryEntity.setName(request.name());
        categoryEntity.setDescription(request.description());
        categoryEntity.setCategoryType(request.categoryType());

        return categoryEntity;
    }

    public static GetCategoryUseCaseResponse toGetCategory(CategoryEntity category){
        return new GetCategoryUseCaseResponse(
                category.getId(),
                category.getKhataBookId(),
                category.getName(),
                category.getDescription(),
                category.getCategoryType(),
                category.getCreatedAt(),
                category.getUpdatedAt()

        );
    }

    public static CategoryEntity toUpdateEntity(CategoryEntity categoryEntity,UpdateCategoryUseCaseRequest request){
        categoryEntity.setName(request.name());
        categoryEntity.setDescription(request.description());
        categoryEntity.setCategoryType(request.categoryType());
        categoryEntity.setUpdatedAt(Instant.now());

        return categoryEntity;
    }


}

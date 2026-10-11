package com.puff.tech.rentalitem.usecase.getall;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAllRentalUCRequest(

) implements UCRequest {
}

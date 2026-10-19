package com.puff.tech.staffmanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUCRequest;
import com.puff.tech.usermanagement.enums.Permission;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAttendanceUC;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAttendanceUCRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAttendanceUCResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.delete.DeleteStaffAttendanceUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.delete.DeleteStaffAttendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.delete.DeleteStaffAttendanceUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUCResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbydate.GetStaffAttendanceByDateUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbydate.GetStaffAttendanceByDateUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbyid.GetStaffAttendanceByIdUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbyid.GetStaffAttendanceByIdUCRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbystaff.GetStaffAttendanceByStaffIdUC;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbystaff.GetStaffAttendanceByStaffIdUCRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

@Controller("staff-attendance")
public class StaffAttendanceController {

    private final CreateStaffAttendanceUC createStaffAttendanceUC;
    private final GetStaffAttendanceUseCase getStaffAttendanceUseCase;
    private final GetStaffAttendanceByDateUseCase getStaffAttendanceByDateUseCase;
    private final GetStaffAttendanceByIdUseCase getStaffAttendanceByIdUseCase;
    private final GetStaffAttendanceByStaffIdUC getStaffAttendanceByStaffIdUC;
    private final UpdateSatffAttendanceUseCase updateSatffAttendanceUseCase;
    private final DeleteStaffAttendanceUseCase deleteStaffAttendanceUseCase;

    @Inject
    public StaffAttendanceController(CreateStaffAttendanceUC createStaffAttendanceUC,
                                     GetStaffAttendanceUseCase getStaffAttendanceUseCase,
                                     GetStaffAttendanceByDateUseCase getStaffAttendanceByDateUseCase,
                                     GetStaffAttendanceByIdUseCase getStaffAttendanceByIdUseCase,
                                     GetStaffAttendanceByStaffIdUC getStaffAttendanceByStaffIdUC,
                                     UpdateSatffAttendanceUseCase updateSatffAttendanceUseCase,
                                     DeleteStaffAttendanceUseCase deleteStaffAttendanceUseCase) {
        this.createStaffAttendanceUC = createStaffAttendanceUC;
        this.getStaffAttendanceUseCase = getStaffAttendanceUseCase;
        this.getStaffAttendanceByDateUseCase = getStaffAttendanceByDateUseCase;
        this.getStaffAttendanceByIdUseCase = getStaffAttendanceByIdUseCase;
        this.getStaffAttendanceByStaffIdUC = getStaffAttendanceByStaffIdUC;
        this.updateSatffAttendanceUseCase = updateSatffAttendanceUseCase;
        this.deleteStaffAttendanceUseCase = deleteStaffAttendanceUseCase;
    }

    @Secured(permissions = {Permission.STAFF_ATTENDANCE_CREATE, Permission.STAFF_CREATE, Permission.STAFF_UPDATE})
    @Post()
    public Mono<RestResponse<CreateStaffAttendanceUCResponse>> create(@Body CreateStaffAttendanceUCRequest request){
        return createStaffAttendanceUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error creating attendance: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_ATTENDANCE_FIND_ALL, Permission.STAFF_ATTENDANCE_FIND_ONE, Permission.STAFF_FIND_ALL})
    @Get()
    public Mono<RestResponse<List<GetStaffAttendanceUCResponse>>> get(){
        return getStaffAttendanceUseCase.execute(new GetStaffAttendanceUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error fetching attendances: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_ATTENDANCE_FIND_ALL, Permission.STAFF_ATTENDANCE_FIND_ONE, Permission.STAFF_FIND_ALL})
    @Get("date/{date}")
    public Mono<RestResponse<List<GetStaffAttendanceUCResponse>>> getByDate(@PathVariable Instant date){
        var request = new GetStaffAttendanceByDateUseCaseRequest(date);
        return getStaffAttendanceByDateUseCase.execute(request)
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error fetching attendances by date: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_ATTENDANCE_FIND_ALL, Permission.STAFF_ATTENDANCE_FIND_ONE, Permission.STAFF_FIND_ALL})
    @Get("staff/{staffId}")
    public Mono<RestResponse<List<GetStaffAttendanceUCResponse>>> getByStaff(@PathVariable Long staffId){
        var request = new GetStaffAttendanceByStaffIdUCRequest(staffId);
        return getStaffAttendanceByStaffIdUC.execute(request)
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error fetching attendances by staff: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_ATTENDANCE_FIND_ONE, Permission.STAFF_ATTENDANCE_FIND_ALL, Permission.STAFF_FIND_ONE, Permission.STAFF_FIND_ALL})
    @Get("{id}")
    public Mono<RestResponse<GetStaffAttendanceUCResponse>> getById(@PathVariable Long id){
        var request = new GetStaffAttendanceByIdUCRequest(id);
        return getStaffAttendanceByIdUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error fetching attendance: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_ATTENDANCE_UPDATE, Permission.STAFF_ATTENDANCE_CREATE, Permission.STAFF_UPDATE, Permission.STAFF_CREATE})
    @Put()
    public Mono<RestResponse<UpdateSatffAttendanceUseCaseResponse>> update(@Body UpdateSatffAttendanceUseCaseRequest request){
        return updateSatffAttendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error updating attendance: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_ATTENDANCE_DELETE, Permission.STAFF_DELETE})
    @Delete("{id}")
    public Mono<RestResponse<DeleteStaffAttendanceUseCaseResponse>> delete(@PathVariable Integer id){
        var request = new DeleteStaffAttendanceUseCaseRequest(id);
        return deleteStaffAttendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error deleting attendance: " + err.getLocalizedMessage())));
    }
}

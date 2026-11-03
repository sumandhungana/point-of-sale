package com.puff.tech.setting.repository;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface DashboardSettingsRepository extends ReactorCrudRepository<DashboardSettingsEntity, Long> {

    Mono<DashboardSettingsEntity> findByMemberIdAndRoleName(Long memberId, String roleName);
    Mono<DashboardSettingsEntity> findByRoleName(String roleName);

    Flux<DashboardSettingsEntity> findByMemberId(Long memberId);
    Mono<DashboardSettingsEntity> findByMemberIdAndRoleId(Long memberId, Integer roleId);

    @Query("SELECT * FROM dashboard_settings WHERE member_id = :memberId AND role_name = :roleName LIMIT 1")
    Mono<DashboardSettingsEntity> findByMemberIdAndRoleNameCustom(Long memberId, String roleName);

    @Query("SELECT * FROM dashboard_settings WHERE member_id IS NULL AND role_name = :roleName LIMIT 1")
    Mono<DashboardSettingsEntity> findGlobalDefaultByRoleName(String roleName);

    @Query("SELECT * FROM dashboard_settings WHERE " +
           "(LOWER(role_name) = LOWER(:roleName) " +
           " OR REPLACE(LOWER(role_name), ' ', '_') = REPLACE(LOWER(:roleName), ' ', '_') " +
           " OR REPLACE(LOWER(role_name), '_', ' ') = REPLACE(LOWER(:roleName), '_', ' ') " +
           " OR CAST(role_id AS TEXT) = :roleName " +
           " OR (:roleOrder IS NOT NULL AND role_order = :roleOrder)) " +
           "ORDER BY " +
           "(CASE WHEN :memberId IS NOT NULL AND member_id = :memberId AND LOWER(role_name) = LOWER(:roleName) THEN 0 " +
           "      WHEN :memberId IS NOT NULL AND member_id = :memberId THEN 1 " +
           "      WHEN LOWER(role_name) = LOWER(:roleName) THEN 2 " +
           "      WHEN :roleOrder IS NOT NULL AND role_order = :roleOrder THEN 3 " +
           "      ELSE 4 END), " +
           "id DESC LIMIT 1")
    Mono<DashboardSettingsEntity> findEffectiveSetting(Long memberId, String roleName, Integer roleOrder);

    default Mono<DashboardSettingsEntity> findEffectiveSetting(Long memberId, String roleName) {
        return findEffectiveSetting(memberId, roleName, null);
    }

}


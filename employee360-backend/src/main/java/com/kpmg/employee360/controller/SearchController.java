package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.service.SearchService;
import com.kpmg.employee360.service.PermissionService;
import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.enums.Permission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Unified global search APIs")
@CrossOrigin
public class SearchController {

    private final SearchService searchService;
    private final PermissionService permissionService;

    @GetMapping
    @Operation(summary = "Search across employees and projects (Basic)")
    public ResponseEntity<ApiResponse<SearchResultsDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(searchService.search(q)));
    }

    @GetMapping("/global")
    @Operation(summary = "Enterprise-grade global search with permission filtering")
    public ResponseEntity<ApiResponse<SearchResultsDTO>> globalSearch(
            @RequestParam String q,
            @RequestParam(defaultValue = "ALL") String type) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        boolean fullSearch = permissionService.hasPermission(currentUserId, Permission.SEARCH_FULL);
        return ResponseEntity.ok(ApiResponse.success(searchService.globalSearch(q, type, fullSearch)));
    }
}

using System.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace Backend.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            await _next(context);
            stopwatch.Stop();
            _logger.LogInformation(
                "Request {method} {url} completed in {elapsed}ms with status code {statusCode}",
                context.Request.Method,
                context.Request.Path,
                stopwatch.ElapsedMilliseconds,
                context.Response.StatusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Request {method} {url} failed", context.Request.Method, context.Request.Path);
            throw;
        }
    }
} 
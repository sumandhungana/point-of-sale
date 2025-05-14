using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using Backend.Controllers;

namespace Backend.Middleware;

public class JwtAuthMiddleware
{
    private readonly RequestDelegate _next;
    private const string Secret = "NKJNTYUIHTUYHBTGYFJBSDANIAUSD)"; // Use config in production

    public JwtAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower();
        if (path != null && (path.Contains("/api/user/login") || path.Contains("/api/user/logout")))
        {
            await _next(context);
            return;
        }   

        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"Missing or invalid Authorization header\"}");
            return;
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        var handler = new JwtSecurityTokenHandler();
        try
        {
            var key = Encoding.ASCII.GetBytes(Secret);
            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = System.TimeSpan.Zero
            };
            var principal = handler.ValidateToken(token, parameters, out var validatedToken);
            var jwt = validatedToken as JwtSecurityToken;
            var jti = jwt?.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
            if (!string.IsNullOrEmpty(jti) && UserController.IsTokenBlacklisted(jti))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"error\":\"Token is expired or blacklisted\"}");
                return;
            }
            // Optionally set user context here
            await _next(context);
        }
        catch
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"Invalid or expired token\"}");
        }
    }
} 
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Collections.Concurrent;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserController> _logger;

    // In-memory JWT blacklist: jti -> expiry
    private static readonly ConcurrentDictionary<string, DateTime> JwtBlacklist = new();

    public UserController(ApplicationDbContext context, ILogger<UserController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/User
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.OrderByDescending(u => u.CreatedAt).ToListAsync();
    }

    // GET: api/User/5
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    // POST: api/User
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        
        _context.Users.Add(user);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            if (UserExists(user.Username))
            {
                return Conflict("Username already exists");
            }
            else
            {
                _logger.LogError(ex, "Error creating user");
                throw;
            }
        }

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    // PUT: api/User/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest();
        }

        // Check if username is being changed and if it already exists
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
        {
            return NotFound();
        }

        // If username is being changed, check for uniqueness
        if (existingUser.Username != user.Username)
        {
            if (UserExists(user.Username))
            {
                return Conflict("Username already exists");
            }
        }

        user.UpdatedAt = DateTime.UtcNow;
        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExistsById(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }
        catch (DbUpdateException ex)
        {
            if (UserExists(user.Username))
            {
                return Conflict("Username already exists");
            }
            else
            {
                _logger.LogError(ex, "Error updating user");
                throw;
            }
        }
        return Ok(new { message = "User updated successfully" });
    }

    // DELETE: api/User/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null)
            return Unauthorized("Invalid username or password");

        // Hash the provided password with the stored salt
        var hash = HashPassword(request.Password, user.PasswordSalt);
        if (hash != user.PasswordHash)
            return Unauthorized("Invalid username or password");

        // Generate JWT
        var token = GenerateJwtToken(user);
        return Ok(new { token });
    }

    private static string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var salted = Encoding.UTF8.GetBytes(password + salt);
        var hash = sha256.ComputeHash(salted);
        return Convert.ToBase64String(hash);
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("NKJNTYUIHTUYHBTGYFJBSDANIAUSD"); // Use config in production
        var jti = Guid.NewGuid().ToString();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Permission),
                new Claim(JwtRegisteredClaimNames.Jti, jti)
            }),
            Expires = DateTime.UtcNow.AddHours(8),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    private bool UserExistsById(int id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
    
    private bool UserExists(string username)
    {
        return _context.Users.Any(e => e.Username == username);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return BadRequest(new { message = "No token provided." });

        var token = authHeader.Substring("Bearer ".Length).Trim();
        var handler = new JwtSecurityTokenHandler();
        try
        {
            var jwt = handler.ReadJwtToken(token);
            // Check if token is expired
            if (jwt.ValidTo < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Token is already expired." });
            }
            var jti = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
            var exp = jwt.ValidTo;
            if (!string.IsNullOrEmpty(jti))
            {
                if (JwtBlacklist.TryGetValue(jti, out var expiry) && expiry > DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Token already logged out." });
                }
                JwtBlacklist[jti] = exp;
                return Ok(new { message = "Logged out successfully." });
            }
            return BadRequest(new { message = "Invalid token." });
        }
        catch
        {
            return BadRequest(new { message = "Invalid token format." });
        }
    }

    // Helper for future middleware
    public static bool IsTokenBlacklisted(string jti)
    {
        if (JwtBlacklist.TryGetValue(jti, out var expiry))
        {
            if (expiry > DateTime.UtcNow)
                return true;
            // Clean up expired entries
            JwtBlacklist.TryRemove(jti, out _);
        }
        return false;
    }
} 
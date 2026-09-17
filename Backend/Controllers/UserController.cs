using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Helpers;

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

    private static readonly ConcurrentDictionary<string, DateTime> JwtBlacklist = new();

    public UserController(
        ApplicationDbContext context,
        ILogger<UserController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============================================================
    // GET ALL USERS
    // ============================================================

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Enable,
                u.Branch,
                u.Permission,
                u.Parent,
                u.Name,
                u.Address,
                u.Company,
                u.Email,
                u.Phone,
                u.Pan,
                u.Remarks,
                u.ImagePath,
                u.CreatedAt,
                u.UpdatedAt,
                SubscriptionType = u.SubscriptionType.ToString(),
                u.SubscriptionStartDate,
                u.SubscriptionEndDate,
                u.IsSubscriptionActive,
                u.HasUsedTrial,
                u.TrialStartDate,
                u.TrialEndDate,
                SubscriptionStatus = u.SubscriptionStatus.ToString(),
                RemainingDays = u.SubscriptionEndDate.HasValue 
                    ? (u.SubscriptionEndDate.Value - DateTime.UtcNow).Days 
                    : 0
            })
            .ToListAsync();

        return Ok(users);
    }

    // ============================================================
    // GET USER BY ID
    // ============================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Enable,
                u.Branch,
                u.Permission,
                u.Parent,
                u.Name,
                u.Address,
                u.Company,
                u.Email,
                u.Phone,
                u.Pan,
                u.Remarks,
                u.ImagePath,
                u.CreatedAt,
                u.UpdatedAt,
                SubscriptionType = u.SubscriptionType.ToString(),
                u.SubscriptionStartDate,
                u.SubscriptionEndDate,
                u.IsSubscriptionActive,
                u.HasUsedTrial,
                u.TrialStartDate,
                u.TrialEndDate,
                SubscriptionStatus = u.SubscriptionStatus.ToString(),
                RemainingDays = u.SubscriptionEndDate.HasValue 
                    ? (u.SubscriptionEndDate.Value - DateTime.UtcNow).Days 
                    : 0
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(user);
    }

    // ============================================================
    // CREATE USER
    // POST: api/User
    // ============================================================

    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> CreateUser(
        [FromForm] string username,
        [FromForm] string password,
        [FromForm] bool enable = false,
        [FromForm] string? branch = null,
        [FromForm] string? permission = null,
        [FromForm] string? parent = null,
        [FromForm] string? name = null,
        [FromForm] string? address = null,
        [FromForm] string? company = null,
        [FromForm] string? email = null,
        [FromForm] string? phone = null,
        [FromForm] string? pan = null,
        [FromForm] string? remarks = null,
        [FromForm] IFormFile? image = null,
        [FromForm] string? subscriptionType = null)
    {
        try
        {
            // ----------------------------------------------------
            // VALIDATE
            // ----------------------------------------------------

            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest(new { message = "Username is required." });
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                return BadRequest(new { message = "Password is required." });
            }

            bool usernameExists = await _context.Users
                .AnyAsync(u => u.Username == username);

            if (usernameExists)
            {
                return Conflict(new { message = "Username already exists." });
            }

            // ----------------------------------------------------
            // CREATE USER
            // ----------------------------------------------------

            var user = new User
            {
                Username = username,
                Enable = enable,
                Branch = branch,
                Permission = permission ?? "user",
                Parent = parent,
                Name = name,
                Address = address,
                Company = company,
                Email = email,
                Phone = phone,
                Pan = pan,
                Remarks = remarks,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // ----------------------------------------------------
            // PASSWORD HASH
            // ----------------------------------------------------

            byte[] salt = RandomNumberGenerator.GetBytes(16);
            byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                100000,
                HashAlgorithmName.SHA256,
                32
            );

            user.PasswordSalt = Convert.ToBase64String(salt);
            user.PasswordHash = Convert.ToBase64String(hash);
            user.Password = string.Empty;

            // ----------------------------------------------------
            // IMAGE UPLOAD
            // ----------------------------------------------------

            if (image != null)
            {
                user.ImagePath = await FileUploadHelper.UploadFileAsync(image, _logger);
            }

            // ----------------------------------------------------
            // SUBSCRIPTION HANDLING
            // ----------------------------------------------------

            if (!string.IsNullOrWhiteSpace(subscriptionType))
            {
                var subType = subscriptionType.ToLower();
                
                user.SubscriptionType = subType switch
                {
                    "trial" => SubscriptionType.Trial,
                    "monthly" => SubscriptionType.Monthly,
                    "yearly" => SubscriptionType.Yearly,
                    _ => SubscriptionType.None
                };

                if (user.SubscriptionType != SubscriptionType.None)
                {
                    user.SubscriptionStartDate = DateTime.UtcNow;
                    
                    user.SubscriptionEndDate = user.SubscriptionType switch
                    {
                        SubscriptionType.Trial => DateTime.UtcNow.AddDays(15),
                        SubscriptionType.Monthly => DateTime.UtcNow.AddDays(30),
                        SubscriptionType.Yearly => DateTime.UtcNow.AddDays(365),
                        _ => DateTime.UtcNow.AddDays(30)
                    };

                    if (user.SubscriptionType == SubscriptionType.Trial)
                    {
                        user.HasUsedTrial = true;
                        user.TrialStartDate = DateTime.UtcNow;
                        user.TrialEndDate = DateTime.UtcNow.AddDays(15);
                        user.SubscriptionStatus = SubscriptionStatus.Trial;
                    }
                    else
                    {
                        user.HasUsedTrial = false;
                        user.SubscriptionStatus = SubscriptionStatus.Active;
                    }

                    user.IsSubscriptionActive = true;
                }
            }

            // ----------------------------------------------------
            // SAVE
            // ----------------------------------------------------

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // ----------------------------------------------------
            // RESPONSE
            // ----------------------------------------------------

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                new
                {
                    user.Id,
                    user.Username,
                    user.Enable,
                    user.Branch,
                    user.Permission,
                    user.Parent,
                    user.Name,
                    user.Address,
                    user.Company,
                    user.Email,
                    user.Phone,
                    user.Pan,
                    user.Remarks,
                    user.ImagePath,
                    user.CreatedAt,
                    user.UpdatedAt,
                    SubscriptionType = user.SubscriptionType.ToString(),
                    user.SubscriptionStartDate,
                    user.SubscriptionEndDate,
                    user.IsSubscriptionActive,
                    user.HasUsedTrial,
                    user.TrialStartDate,
                    user.TrialEndDate,
                    SubscriptionStatus = user.SubscriptionStatus.ToString(),
                    RemainingDays = user.SubscriptionEndDate.HasValue 
                        ? (user.SubscriptionEndDate.Value - DateTime.UtcNow).Days 
                        : 0
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while creating user");
            return StatusCode(500, new { message = "Error while creating user." });
        }
    }

    // ============================================================
    // UPDATE USER
    // PUT: api/User/{id}
    // ============================================================

    [HttpPut("{id}")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UpdateUser(
        int id,
        [FromForm] UserUpdateRequest request)
    {
        try
        {
            // ----------------------------------------------------
            // FIND EXISTING USER
            // ----------------------------------------------------

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (existingUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // ----------------------------------------------------
            // VALIDATE USERNAME
            // ----------------------------------------------------

            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new { message = "Username is required." });
            }

            // ----------------------------------------------------
            // CHECK DUPLICATE USERNAME
            // ----------------------------------------------------

            bool usernameExists = await _context.Users.AnyAsync(
                u => u.Username == request.Username && u.Id != id);

            if (usernameExists)
            {
                return Conflict(new { message = "Username already exists." });
            }

            // ----------------------------------------------------
            // UPDATE BASIC INFORMATION
            // ----------------------------------------------------

            existingUser.Username = request.Username;
            existingUser.Enable = request.Enable;
            existingUser.Branch = request.Branch;
            existingUser.Permission = request.Permission;
            existingUser.Parent = request.Parent;

            // ----------------------------------------------------
            // UPDATE PERSONAL INFORMATION
            // ----------------------------------------------------

            existingUser.Name = request.Name;
            existingUser.Address = request.Address;
            existingUser.Company = request.Company;
            existingUser.Email = request.Email;
            existingUser.Phone = request.Phone;
            existingUser.Pan = request.Pan;
            existingUser.Remarks = request.Remarks;

            // ----------------------------------------------------
            // UPDATE IMAGE
            // ----------------------------------------------------

            if (request.Image != null && request.Image.Length > 0)
            {
                string? oldImagePath = existingUser.ImagePath;
                string newImagePath = await FileUploadHelper.UploadFileAsync(request.Image, _logger);
                existingUser.ImagePath = newImagePath;

                if (!string.IsNullOrWhiteSpace(oldImagePath))
                {
                    FileUploadHelper.DeleteFile(oldImagePath);
                }
            }

            // ----------------------------------------------------
            // UPDATE PASSWORD
            // ----------------------------------------------------

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                byte[] salt = RandomNumberGenerator.GetBytes(16);
                byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                    request.Password,
                    salt,
                    100000,
                    HashAlgorithmName.SHA256,
                    32
                );

                existingUser.PasswordSalt = Convert.ToBase64String(salt);
                existingUser.PasswordHash = Convert.ToBase64String(hash);
                existingUser.Password = string.Empty;
            }

            // ============================================================
            // UPDATE SUBSCRIPTION - THIS IS THE FIXED PART
            // ============================================================

            Console.WriteLine($"📝 Updating subscription for user {id}: {request.SubscriptionType}");

            if (!string.IsNullOrWhiteSpace(request.SubscriptionType))
            {
                var subType = request.SubscriptionType.ToLower();
                Console.WriteLine($"📝 Subscription type received: {subType}");

                if (subType == "none" || subType == "cancel")
                {
                    // Cancel subscription
                    existingUser.SubscriptionType = SubscriptionType.None;
                    existingUser.SubscriptionStartDate = null;
                    existingUser.SubscriptionEndDate = null;
                    existingUser.IsSubscriptionActive = false;
                    existingUser.SubscriptionStatus = SubscriptionStatus.Cancelled;
                    Console.WriteLine($"📝 Subscription cancelled for user {id}");
                }
                else
                {
                    var newSubscriptionType = subType switch
                    {
                        "trial" => SubscriptionType.Trial,
                        "monthly" => SubscriptionType.Monthly,
                        "yearly" => SubscriptionType.Yearly,
                        _ => SubscriptionType.None
                    };

                    Console.WriteLine($"📝 New subscription type: {newSubscriptionType}");

                    if (newSubscriptionType != SubscriptionType.None)
                    {
                        existingUser.SubscriptionType = newSubscriptionType;
                        existingUser.SubscriptionStartDate = DateTime.UtcNow;

                        existingUser.SubscriptionEndDate = newSubscriptionType switch
                        {
                            SubscriptionType.Trial => DateTime.UtcNow.AddDays(15),
                            SubscriptionType.Monthly => DateTime.UtcNow.AddDays(30),
                            SubscriptionType.Yearly => DateTime.UtcNow.AddDays(365),
                            _ => DateTime.UtcNow.AddDays(30)
                        };

                        if (newSubscriptionType == SubscriptionType.Trial)
                        {
                            existingUser.HasUsedTrial = true;
                            existingUser.TrialStartDate = DateTime.UtcNow;
                            existingUser.TrialEndDate = DateTime.UtcNow.AddDays(15);
                            existingUser.SubscriptionStatus = SubscriptionStatus.Trial;
                        }
                        else
                        {
                            existingUser.HasUsedTrial = false;
                            existingUser.SubscriptionStatus = SubscriptionStatus.Active;
                        }

                        existingUser.IsSubscriptionActive = true;
                        Console.WriteLine($"📝 Subscription updated: Type={existingUser.SubscriptionType}, EndDate={existingUser.SubscriptionEndDate}, Status={existingUser.SubscriptionStatus}");
                    }
                }
            }
            else
            {
                // If no subscription type is provided, keep existing
                Console.WriteLine($"📝 No subscription type provided, keeping existing: {existingUser.SubscriptionType}");
                
                // But we still need to check if the subscription has expired
                if (existingUser.SubscriptionEndDate.HasValue && 
                    DateTime.UtcNow > existingUser.SubscriptionEndDate.Value)
                {
                    existingUser.IsSubscriptionActive = false;
                    existingUser.SubscriptionStatus = SubscriptionStatus.Expired;
                    Console.WriteLine($"📝 Subscription expired for user {id}");
                }
            }

            // ----------------------------------------------------
            // UPDATED DATE
            // ----------------------------------------------------

            existingUser.UpdatedAt = DateTime.UtcNow;

            // ----------------------------------------------------
            // SAVE
            // ----------------------------------------------------

            await _context.SaveChangesAsync();
            Console.WriteLine($"✅ User {id} updated successfully with subscription: {existingUser.SubscriptionType}");

            // ----------------------------------------------------
            // RESPONSE
            // ----------------------------------------------------

            return Ok(new
            {
                message = "User updated successfully.",
                user = new
                {
                    existingUser.Id,
                    existingUser.Username,
                    existingUser.Enable,
                    existingUser.Branch,
                    existingUser.Permission,
                    existingUser.Parent,
                    existingUser.Name,
                    existingUser.Address,
                    existingUser.Company,
                    existingUser.Email,
                    existingUser.Phone,
                    existingUser.Pan,
                    existingUser.Remarks,
                    existingUser.ImagePath,
                    existingUser.UpdatedAt,
                    // Include subscription fields in response
                    SubscriptionType = existingUser.SubscriptionType.ToString(),
                    existingUser.SubscriptionStartDate,
                    existingUser.SubscriptionEndDate,
                    existingUser.IsSubscriptionActive,
                    existingUser.HasUsedTrial,
                    existingUser.TrialStartDate,
                    existingUser.TrialEndDate,
                    SubscriptionStatus = existingUser.SubscriptionStatus.ToString(),
                    RemainingDays = existingUser.SubscriptionEndDate.HasValue 
                        ? (existingUser.SubscriptionEndDate.Value - DateTime.UtcNow).Days 
                        : 0
                }
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while updating user {UserId}", id);
            return StatusCode(500, new { message = "Error while updating user." });
        }
    }

    // ============================================================
    // DELETE USER
    // DELETE: api/User/{id}
    // ============================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (!string.IsNullOrWhiteSpace(user.ImagePath))
        {
            FileUploadHelper.DeleteFile(user.ImagePath);
        }

        _context.Users.Remove(user);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { message = "Error deleting user." });
        }

        return NoContent();
    }

    // ============================================================
    // LOGIN
    // POST: api/User/login
    // ============================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Unauthorized("Invalid username or password");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null)
        {
            return Unauthorized("Invalid username or password");
        }

        bool passwordValid = false;

        // PBKDF2
        try
        {
            if (!string.IsNullOrWhiteSpace(user.PasswordSalt) && !string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                byte[] salt = Convert.FromBase64String(user.PasswordSalt);
                byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                    request.Password,
                    salt,
                    100000,
                    HashAlgorithmName.SHA256,
                    32
                );

                string passwordHash = Convert.ToBase64String(hash);
                if (passwordHash == user.PasswordHash)
                {
                    passwordValid = true;
                }
            }
        }
        catch
        {
            passwordValid = false;
        }

        // OLD SHA256 FALLBACK
        if (!passwordValid)
        {
            try
            {
                using var sha256 = SHA256.Create();
                var salted = Encoding.UTF8.GetBytes(request.Password + user.PasswordSalt);
                var hash = sha256.ComputeHash(salted);
                var oldPasswordHash = Convert.ToBase64String(hash);

                if (oldPasswordHash == user.PasswordHash)
                {
                    passwordValid = true;
                }
            }
            catch
            {
                passwordValid = false;
            }
        }

        if (!passwordValid)
        {
            return Unauthorized("Invalid username or password");
        }

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            // Include user data in login response
            user = new
            {
                user.Id,
                user.Username,
                user.Name,
                user.Email,
                user.ImagePath,
                SubscriptionType = user.SubscriptionType.ToString(),
                user.SubscriptionStartDate,
                user.SubscriptionEndDate,
                user.IsSubscriptionActive,
                user.HasUsedTrial,
                SubscriptionStatus = user.SubscriptionStatus.ToString()
            }
        });
    }

    // ============================================================
    // GENERATE JWT
    // ============================================================

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("NKJNTYUIHTUYHBTGYFJBSDANIAUSD");
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
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    // ============================================================
    // LOGOUT
    // POST: api/User/logout
    // ============================================================

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return BadRequest(new { message = "No token provided." });
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        var handler = new JwtSecurityTokenHandler();

        try
        {
            var jwt = handler.ReadJwtToken(token);

            if (jwt.ValidTo < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Token is already expired." });
            }

            var jti = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;

            if (!string.IsNullOrEmpty(jti))
            {
                JwtBlacklist[jti] = jwt.ValidTo;
                return Ok(new { message = "Logged out successfully." });
            }

            return BadRequest(new { message = "Invalid token." });
        }
        catch
        {
            return BadRequest(new { message = "Invalid token format." });
        }
    }

    // ============================================================
    // TOKEN BLACKLIST CHECK
    // ============================================================

    public static bool IsTokenBlacklisted(string jti)
    {
        if (JwtBlacklist.TryGetValue(jti, out var expiry))
        {
            if (expiry > DateTime.UtcNow)
            {
                return true;
            }
            JwtBlacklist.TryRemove(jti, out _);
        }
        return false;
    }

    // ============================================================
    // CREATE USER REQUEST
    // ============================================================

    public class UserCreateRequest
    {
        public string Username { get; set; } = string.Empty;
        public bool Enable { get; set; } = true;
        public string Password { get; set; } = string.Empty;
        public string? Branch { get; set; }
        public string Permission { get; set; } = "user";
        public string? Parent { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? Company { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Pan { get; set; }
        public string? Remarks { get; set; }
        public IFormFile? Image { get; set; }
    }

    // ============================================================
    // UPDATE USER REQUEST - ADDED SUBSCRIPTION FIELDS
    // ============================================================

    public class UserUpdateRequest
    {
        public string Username { get; set; } = string.Empty;
        public bool Enable { get; set; }
        public string? Password { get; set; }
        public string? Branch { get; set; }
        public string Permission { get; set; } = "user";
        public string? Parent { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? Company { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Pan { get; set; }
        public string? Remarks { get; set; }
        public IFormFile? Image { get; set; }
        
        // ============================================================
        // SUBSCRIPTION FIELDS - ADD THESE
        // ============================================================
        
        public string? SubscriptionType { get; set; } // "trial", "monthly", "yearly", "none", "cancel"
    }

    // ============================================================
    // LOGIN REQUEST
    // ============================================================

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
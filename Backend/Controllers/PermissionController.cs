using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PermissionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PermissionController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Permission
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Permission>>> GetPermissions()
    {
        return await _context.Permissions.OrderByDescending(p => p.CreatedAt).ToListAsync();
    }

    // GET: api/Permission/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Permission>> GetPermission(int id)
    {
        var permission = await _context.Permissions.FindAsync(id);

        if (permission == null)
        {
            return NotFound();
        }

        return permission;
    }

    // GET: api/Permission/Module/{module}
    [HttpGet("Module/{module}")]
    public async Task<ActionResult<IEnumerable<Permission>>> GetPermissionsByModule(string module)
    {
        return await _context.Permissions
            .Where(p => p.Module == module)
            .ToListAsync();
    }

    // POST: api/Permission
    [HttpPost]
    public async Task<ActionResult<Permission>> CreatePermission(Permission permission)
    {
        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPermission), new { id = permission.Id }, permission);
    }

    // PUT: api/Permission/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePermission(int id, Permission permission)
    {
        if (id != permission.Id)
        {
            return BadRequest();
        }

        _context.Entry(permission).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PermissionExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Permission/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePermission(int id)
    {
        var permission = await _context.Permissions.FindAsync(id);
        if (permission == null)
        {
            return NotFound();
        }

        _context.Permissions.Remove(permission);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PermissionExists(int id)
    {
        return _context.Permissions.Any(e => e.Id == id);
    }
} 
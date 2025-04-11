using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RoleController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Role
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
    {
        return await _context.Roles.Include(r => r.RolePermissions)
                                 .ThenInclude(rp => rp.Permission)
                                 .ToListAsync();
    }

    // GET: api/Role/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Role>> GetRole(int id)
    {
        var role = await _context.Roles.Include(r => r.RolePermissions)
                                     .ThenInclude(rp => rp.Permission)
                                     .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
        {
            return NotFound();
        }

        return role;
    }

    // POST: api/Role
    [HttpPost]
    public async Task<ActionResult<Role>> CreateRole(Role role)
    {
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
    }

    // PUT: api/Role/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRole(int id, Role role)
    {
        if (id != role.Id)
        {
            return BadRequest();
        }

        _context.Entry(role).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RoleExists(id))
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

    // DELETE: api/Role/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
        {
            return NotFound();
        }

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/Role/5/Permissions
    [HttpPost("{roleId}/Permissions")]
    public async Task<IActionResult> AddPermissionsToRole(int roleId, [FromBody] List<int> permissionIds)
    {
        var role = await _context.Roles.FindAsync(roleId);
        if (role == null)
        {
            return NotFound("Role not found");
        }

        var permissions = await _context.Permissions
            .Where(p => permissionIds.Contains(p.Id))
            .ToListAsync();

        foreach (var permission in permissions)
        {
            if (!await _context.RolePermissions.AnyAsync(rp => rp.RoleId == roleId && rp.PermissionId == permission.Id))
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = permission.Id
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    // DELETE: api/Role/5/Permissions
    [HttpDelete("{roleId}/Permissions")]
    public async Task<IActionResult> RemovePermissionsFromRole(int roleId, [FromBody] List<int> permissionIds)
    {
        var rolePermissions = await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId && permissionIds.Contains(rp.PermissionId))
            .ToListAsync();

        _context.RolePermissions.RemoveRange(rolePermissions);
        await _context.SaveChangesAsync();

        return Ok();
    }

    private bool RoleExists(int id)
    {
        return _context.Roles.Any(e => e.Id == id);
    }
} 
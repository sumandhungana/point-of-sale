using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using System.Linq;
using System.Data;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CustomerController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public CustomerController(
        ApplicationDbContext context, 
        ILogger<CustomerController> logger,
        IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/Customer
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Customers
            .Where(c => c.KhataBookId == currentKhataBookId && !c.isSupplier)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();
        
    }

    // GET: api/Customer/suppliers
    [HttpGet("suppliers")]
    public async Task<ActionResult<IEnumerable<Customer>>> GetSuppliers()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Customers
            .Where(c => c.KhataBookId == currentKhataBookId && c.isSupplier)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Customer/customers
    [HttpGet("customers")]
    public async Task<ActionResult<IEnumerable<Customer>>> GetOnlyCustomers()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Customers
            .Where(c => c.KhataBookId == currentKhataBookId && !c.isSupplier)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();
    }

    // GET: api/Customer/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Customer>> GetCustomer(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);

        if (customer == null)
        {
            return NotFound();
        }

        return customer;
    }

    // POST: api/Customer
    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer(CreateCustomerDto customerDto)
    {
        var customer = new Customer
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            Name = customerDto.Name,
            Phone = customerDto.Phone,
            Email = customerDto.Email,
            Address = customerDto.Address,
            Company = customerDto.Company,
            Pan = customerDto.Pan,
            ContactPerson = customerDto.ContactPerson,
            isSupplier = customerDto.isSupplier,
            BankAccount = customerDto.BankAccount,
            CashBalance = customerDto.CashBalance,
            ProfileImage = customerDto.ProfileImage,
            CustomerSmsSetting = customerDto.CustomerSmsSetting,
            SmsLanguage = customerDto.SmsLanguage,
            TransactionHistoryCheck = customerDto.TransactionHistoryCheck,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.Customers.Add(customer);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating customer");
            throw;
        }

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    // PUT: api/Customer/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, UpdateCustomerDto updateDto)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);
        if (customer == null)
        {
            return NotFound();
        }

        // Update only the provided properties
        if (!string.IsNullOrEmpty(updateDto.Name))
            customer.Name = updateDto.Name;
        if (updateDto.Phone != null)
            customer.Phone = updateDto.Phone;
        if (updateDto.Email != null)
            customer.Email = updateDto.Email;
        if (updateDto.Address != null)
            customer.Address = updateDto.Address;
        if (updateDto.Company != null)
            customer.Company = updateDto.Company;
        if (updateDto.Pan != null)
            customer.Pan = updateDto.Pan;
        if (updateDto.ContactPerson != null)
            customer.ContactPerson = updateDto.ContactPerson;
        if (updateDto.BankAccount != null)
            customer.BankAccount = updateDto.BankAccount;
        if (updateDto.ProfileImage != null)
            customer.ProfileImage = updateDto.ProfileImage;
        
        // Update boolean and decimal fields only if they are provided
        if (updateDto.isSupplier.HasValue)
            customer.isSupplier = updateDto.isSupplier.Value;
        if (updateDto.CashBalance.HasValue)
            customer.CashBalance = updateDto.CashBalance.Value;
        if (updateDto.CustomerSmsSetting.HasValue)
            customer.CustomerSmsSetting = updateDto.CustomerSmsSetting.Value;
        if (updateDto.SmsLanguage.HasValue)
            customer.SmsLanguage = updateDto.SmsLanguage.Value;
        if (updateDto.TransactionHistoryCheck.HasValue)
            customer.TransactionHistoryCheck = updateDto.TransactionHistoryCheck.Value;
        Console.WriteLine($"Customer Id: {updateDto.PaymentDateReminder}");    
        // Working for payment date timme reminder
        if (updateDto.PaymentDateReminder != null){
            customer.PaymentDateReminder = DateTime.SpecifyKind(
                    updateDto.PaymentDateReminder.Value,
                DateTimeKind.Utc);
        }
            

        customer.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CustomerExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return Ok(new { message = "Customer updated successfully" });
    }

    // DELETE: api/Customer/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);
        if (customer == null)
        {
            return NotFound();
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CustomerExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.Customers.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 
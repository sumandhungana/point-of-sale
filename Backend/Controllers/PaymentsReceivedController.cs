using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsReceivedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentsReceivedController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PaymentsReceived
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentsReceived>>> GetPaymentsReceived()
        {
            return await _context.PaymentsReceived
                .Include(p => p.Party)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        // GET: api/PaymentsReceived/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentsReceived>> GetPaymentsReceived(int id)
        {
            var paymentsReceived = await _context.PaymentsReceived
                .Include(p => p.Party)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (paymentsReceived == null)
            {
                return NotFound();
            }

            return paymentsReceived;
        }

        // GET: api/PaymentsReceived/party/5
        [HttpGet("party/{partyId}")]
        public async Task<ActionResult<IEnumerable<PaymentsReceived>>> GetPaymentsReceivedByParty(int partyId)
        {
            return await _context.PaymentsReceived
                .Include(p => p.Party)
                .Where(p => p.PartyId == partyId)
                .ToListAsync();
        }

        // GET: api/PaymentsReceived/history/party/5
        [HttpGet("history/party/{partyId}")]
        public async Task<ActionResult<IEnumerable<PaymentHistory>>> GetPaymentHistoryByParty(int partyId)
        {
            // Get all payments given and received for the party
            var givenPayments = await _context.PaymentsGiven
                .Include(p => p.Party)
                .Where(p => p.PartyId == partyId)
                .Select(p => new PaymentHistory
                {
                    Id = p.Id,
                    PartyId = p.PartyId,
                    PartyName = p.Party.Name,
                    Amount = p.Amount,
                    Remarks = p.Remarks,
                    Date = p.Date,
                    BillPath = p.BillPath,
                    Type = "Given",
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            var receivedPayments = await _context.PaymentsReceived
                .Include(p => p.Party)
                .Where(p => p.PartyId == partyId)
                .Select(p => new PaymentHistory
                {
                    Id = p.Id,
                    PartyId = p.PartyId,
                    PartyName = p.Party.Name,
                    Amount = p.Amount,
                    Remarks = p.Remarks,
                    Date = p.Date,
                    BillPath = p.BillPath,
                    Type = "Received",
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            // Merge and sort by date
            var allPayments = givenPayments.Concat(receivedPayments)
                .OrderBy(p => p.Date)
                .ToList();

            // Calculate running balance
            decimal currentBalance = 0;
            foreach (var payment in allPayments)
            {
                payment.OldBalance = currentBalance;
                if (payment.Type == "Given")
                {
                    currentBalance -= payment.Amount;
                }
                else
                {
                    currentBalance += payment.Amount;
                }
                payment.NewBalance = currentBalance;
            }

            return allPayments;
        }

        // POST: api/PaymentsReceived
        [HttpPost]
        public async Task<ActionResult<PaymentsReceived>> PostPaymentsReceived([FromBody] PaymentsReceived paymentsReceived)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find the party first
            var party = await _context.Customers.FindAsync(paymentsReceived.PartyId);
            if (party == null)
            {
                return BadRequest("Invalid PartyId");
            }

            // Create a new instance to avoid any navigation property issues
            var newPayment = new PaymentsReceived
            {
                PartyId = paymentsReceived.PartyId,
                Amount = paymentsReceived.Amount,
                Remarks = paymentsReceived.Remarks,
                Date = paymentsReceived.Date,
                BillPath = paymentsReceived.BillPath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PaymentsReceived.Add(newPayment);
            await _context.SaveChangesAsync();

            // Load the party for the response
            await _context.Entry(newPayment).Reference(p => p.Party).LoadAsync();

            return CreatedAtAction("GetPaymentsReceived", new { id = newPayment.Id }, newPayment);
        }

        // PUT: api/PaymentsReceived/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPaymentsReceived(int id, [FromBody] PaymentsReceivedUpdateDto updateDto)
        {
            var existingPayment = await _context.PaymentsReceived.FindAsync(id);
            if (existingPayment == null)
            {
                return NotFound();
            }

            // Update only the specified fields
            existingPayment.Amount = updateDto.Amount;
            existingPayment.Remarks = updateDto.Remarks;
            existingPayment.Date = updateDto.Date;
            existingPayment.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PaymentsReceivedExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Ok(new { message = "Payment received updated successfully" });
        }

        // DELETE: api/PaymentsReceived/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaymentsReceived(int id)
        {
            var paymentsReceived = await _context.PaymentsReceived.FindAsync(id);
            if (paymentsReceived == null)
            {
                return NotFound();
            }

            _context.PaymentsReceived.Remove(paymentsReceived);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Payment received deleted successfully" });
        }

        private bool PaymentsReceivedExists(int id)
        {
            return _context.PaymentsReceived.Any(e => e.Id == id);
        }

        // DTO for updating payments received
        public class PaymentsReceivedUpdateDto
        {
            public int Id { get; set; }
            public decimal Amount { get; set; }
            public string Remarks { get; set; }
            public DateTime Date { get; set; }
        }
    }
} 
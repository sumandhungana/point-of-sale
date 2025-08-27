using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemMonitorController : ControllerBase
    {
        [AllowAnonymous]
        [HttpGet("metrics")]
        public IActionResult GetSystemMetrics()
        {
            try
            {
                var metrics = new
                {
                    CpuUsage = GetCpuUsage(),
                    MemoryUsage = GetMemoryUsage(),
                    DiskUsage = GetDiskUsage(),
                    Timestamp = DateTime.UtcNow
                };

                return Ok(metrics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        private double GetCpuUsage()
        {
            try
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    // Linux: read /proc/stat twice and compute delta
                    (ulong idle1, ulong total1) = ReadProcStat();
                    Thread.Sleep(1000);
                    (ulong idle2, ulong total2) = ReadProcStat();

                    var idleDelta = idle2 - idle1;
                    var totalDelta = total2 - total1;
                    if (totalDelta == 0) return 0.0;
                    var cpu = (1.0 - (double)idleDelta / totalDelta) * 100.0;
                    return Math.Round(cpu, 1);
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    // macOS: sysctl kern.cp_time twice
                    (ulong idle1, ulong total1) = ReadMacCpuTimes();
                    Thread.Sleep(1000);
                    (ulong idle2, ulong total2) = ReadMacCpuTimes();
                    var idleDelta = idle2 - idle1;
                    var totalDelta = total2 - total1;
                    if (totalDelta == 0) return 0.0;
                    var cpu = (1.0 - (double)idleDelta / totalDelta) * 100.0;
                    return Math.Round(cpu, 1);
                }
                // Windows fallback (no WMI dependency here) — return 0 without extra packages
                return 0.0;
            }
            catch
            {
                return 0.0;
            }
        }

        private double GetMemoryUsage()
        {
            try
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    // Linux: read /proc/meminfo
                    var memInfo = System.IO.File.ReadAllLines("/proc/meminfo");
                    ulong memTotal = 0;
                    ulong memAvailable = 0;
                    foreach (var line in memInfo)
                    {
                        if (line.StartsWith("MemTotal:"))
                        {
                            memTotal = ParseKbLine(line);
                        }
                        else if (line.StartsWith("MemAvailable:"))
                        {
                            memAvailable = ParseKbLine(line);
                        }
                    }
                    if (memTotal == 0) return 0.0;
                    var used = memTotal - memAvailable;
                    var percent = (double)used / memTotal * 100.0;
                    return Math.Round(percent, 1);
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    // macOS: use sysctl hw.memsize for total and vm_stat for free/inactive pages
                    ulong memTotal = ExecSysctlULong("hw.memsize");
                    ulong pageSize = ExecSysctlULong("hw.pagesize");
                    if (pageSize == 0) pageSize = 4096;
                    (ulong free, ulong inactive) = ReadMacVmStat(pageSize);
                    ulong memAvailable = free + inactive;
                    if (memTotal == 0) return 0.0;
                    var used = memTotal - memAvailable;
                    var percent = (double)used / memTotal * 100.0;
                    return Math.Round(percent, 1);
                }
                // Windows fallback
                return 0.0;
            }
            catch
            {
                return 0.0;
            }
        }

        private double GetDiskUsage()
        {
            try
            {
                DriveInfo? drive;
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) || RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    drive = DriveInfo.GetDrives().FirstOrDefault(d => d.IsReady && d.Name == "/");
                    if (drive == null)
                    {
                        drive = DriveInfo.GetDrives().FirstOrDefault(d => d.IsReady);
                    }
                }
                else
                {
                    drive = DriveInfo.GetDrives().FirstOrDefault(d => d.IsReady && d.Name.StartsWith("C"));
                }
                if (drive != null)
                {
                    var totalSize = drive.TotalSize;
                    var freeSpace = drive.TotalFreeSpace;
                    var usedSpace = totalSize - freeSpace;
                    return totalSize > 0 ? Math.Round((double)usedSpace / totalSize * 100, 1) : 0.0;
                }
                return 0.0;
            }
            catch
            {
                return 0.0;
            }
        }

        // Removed Windows-only WMI memory helpers to keep the project cross-platform without extra packages

        private (ulong idle, ulong total) ReadProcStat()
        {
            var line = System.IO.File.ReadLines("/proc/stat").First(l => l.StartsWith("cpu "));
            var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            // cpu user nice system idle iowait irq softirq steal guest guest_nice
            ulong user = ulong.Parse(parts[1]);
            ulong nice = ulong.Parse(parts[2]);
            ulong system = ulong.Parse(parts[3]);
            ulong idle = ulong.Parse(parts[4]);
            ulong iowait = parts.Length > 5 ? ulong.Parse(parts[5]) : 0;
            ulong irq = parts.Length > 6 ? ulong.Parse(parts[6]) : 0;
            ulong softirq = parts.Length > 7 ? ulong.Parse(parts[7]) : 0;
            ulong steal = parts.Length > 8 ? ulong.Parse(parts[8]) : 0;
            ulong total = user + nice + system + idle + iowait + irq + softirq + steal;
            return (idle, total);
        }

        private static ulong ParseKbLine(string line)
        {
            // Example: MemTotal:       16342428 kB
            var parts = line.Split(':');
            if (parts.Length < 2) return 0;
            var number = new string(parts[1].Where(char.IsDigit).ToArray());
            if (ulong.TryParse(number, out var kb))
            {
                return kb * 1024; // bytes
            }
            return 0;
        }

        private static ulong ExecSysctlULong(string key)
        {
            try
            {
                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "/usr/sbin/sysctl",
                    ArgumentList = { "-n", key },
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false
                };
                using var p = System.Diagnostics.Process.Start(psi);
                if (p == null) return 0;
                var output = p.StandardOutput.ReadToEnd().Trim();
                p.WaitForExit(2000);
                if (ulong.TryParse(output, out var value)) return value;
            }
            catch { }
            return 0;
        }

        private (ulong idle, ulong total) ReadMacCpuTimes()
        {
            try
            {
                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "/usr/sbin/sysctl",
                    ArgumentList = { "-n", "kern.cp_time" },
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false
                };
                using var p = System.Diagnostics.Process.Start(psi);
                if (p == null) return (0, 0);
                var output = p.StandardOutput.ReadToEnd().Trim();
                p.WaitForExit(2000);
                // output: user nice sys idle intr
                var parts = output.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length < 5) return (0, 0);
                ulong user = ulong.Parse(parts[0]);
                ulong nice = ulong.Parse(parts[1]);
                ulong sys = ulong.Parse(parts[2]);
                ulong idle = ulong.Parse(parts[3]);
                ulong intr = ulong.Parse(parts[4]);
                ulong total = user + nice + sys + idle + intr;
                return (idle, total);
            }
            catch { return (0, 0); }
        }

        private (ulong freeBytes, ulong inactiveBytes) ReadMacVmStat(ulong pageSize)
        {
            try
            {
                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "/usr/bin/vm_stat",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false
                };
                using var p = System.Diagnostics.Process.Start(psi);
                if (p == null) return (0, 0);
                var output = p.StandardOutput.ReadToEnd();
                p.WaitForExit(2000);
                ulong freePages = 0;
                ulong inactivePages = 0;
                foreach (var line in output.Split('\n'))
                {
                    if (line.StartsWith("Pages free:"))
                    {
                        freePages = ParseVmStatPages(line);
                    }
                    else if (line.StartsWith("Pages inactive:"))
                    {
                        inactivePages = ParseVmStatPages(line);
                    }
                }
                return (freePages * pageSize, inactivePages * pageSize);
            }
            catch { return (0, 0); }
        }

        private static ulong ParseVmStatPages(string line)
        {
            var digits = new string(line.Where(char.IsDigit).ToArray());
            if (ulong.TryParse(digits, out var pages)) return pages;
            return 0;
        }
    }
}


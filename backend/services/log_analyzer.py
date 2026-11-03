import re


RULES = [
    {
        "severity": "CRITICAL",
        "pattern": r"\bcritical\b",
        "category": "Critical System Event",
        "cause": "A critical event was explicitly reported in the log.",
        "solution": "Investigate this event immediately, inspect related logs, and restore the affected service."
    },
    {
        "severity": "CRITICAL",
        "pattern": r"out of memory|oom|memory exhausted",
        "category": "Memory Failure",
        "cause": "Application has run out of available memory.",
        "solution": "Check memory usage, increase available memory, and investigate memory leaks."
    },
    {
        "severity": "CRITICAL",
        "pattern": r"database.*(connection refused|unavailable)|connection refused.*database",
        "category": "Database Connection",
        "cause": "Application cannot connect to the database.",
        "solution": "Verify database status, connection URL, port, and network connectivity."
    },
    {
        "severity": "CRITICAL",
        "pattern": r"\bfatal\b|\bpanic\b|segmentation fault|segfault",
        "category": "System Failure",
        "cause": "A fatal system or application failure occurred.",
        "solution": "Inspect the stack trace and recent system or application changes."
    },
    {
        "severity": "HIGH",
        "pattern": r"exception|traceback|internal server error",
        "category": "Application Exception",
        "cause": "An application exception or server error occurred.",
        "solution": "Inspect the exception details and stack trace to identify the failing component."
    },
    {
        "severity": "HIGH",
        "pattern": r"\berror\b|\bfailed\b|\bfailure\b",
        "category": "Application Error",
        "cause": "An operation failed or an application error was reported.",
        "solution": "Review the surrounding log lines and check the affected service."
    },
    {
        "severity": "MEDIUM",
        "pattern": r"timeout|timed out",
        "category": "Timeout",
        "cause": "An operation took longer than the allowed time.",
        "solution": "Check network latency, service response time, and timeout configuration."
    },
    {
        "severity": "LOW",
        "pattern": r"warning|deprecated|retry",
        "category": "Warning",
        "cause": "A warning or retry event was reported.",
        "solution": "Review the warning and update deprecated configurations if required."
    }
]


def analyze_logs(log_text):
    lines = log_text.splitlines()

    findings = []

    counts = {
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0
    }

    for line_number, line in enumerate(lines, start=1):
        if not line.strip():
            continue

        for rule in RULES:
            if re.search(rule["pattern"], line, re.IGNORECASE):
                severity = rule["severity"]
                counts[severity] += 1

                findings.append({
                    "line_number": line_number,
                    "log": line.strip(),
                    "severity": severity,
                    "category": rule["category"],
                    "root_cause": rule["cause"],
                    "recommendation": rule["solution"]
                })

                break

    total_issues = len(findings)

    if counts["CRITICAL"] > 0:
        overall_severity = "CRITICAL"
    elif counts["HIGH"] > 0:
        overall_severity = "HIGH"
    elif counts["MEDIUM"] > 0:
        overall_severity = "MEDIUM"
    elif counts["LOW"] > 0:
        overall_severity = "LOW"
    else:
        overall_severity = "HEALTHY"

    summary = (
        f"Analyzed {len(lines)} log lines and detected "
        f"{total_issues} issues. "
        f"Critical: {counts['CRITICAL']}, "
        f"High: {counts['HIGH']}, "
        f"Medium: {counts['MEDIUM']}, "
        f"Low: {counts['LOW']}."
    )

    return {
        "total_lines": len(lines),
        "error_count": total_issues,
        "critical_count": counts["CRITICAL"],
        "high_count": counts["HIGH"],
        "medium_count": counts["MEDIUM"],
        "low_count": counts["LOW"],
        "overall_severity": overall_severity,
        "summary": summary,
        "findings": findings
    }
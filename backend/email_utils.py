import os
import datetime
import json
import smtplib
from email.mime.text import MIMEText

LOG_FILE = "dataset/uploads/email_sent.log"

def send_email_notification(to_email: str, subject: str, body: str):
    """
    Sends email notification. 
    If SMTP credentials are in environment, sends real email.
    Otherwise, logs it to a local file for the mock inbox UI.
    """
    timestamp = datetime.datetime.utcnow().isoformat()
    
    # 1. Always write to the mock email log file
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    email_record = {
        "timestamp": timestamp,
        "to": to_email,
        "subject": subject,
        "body": body
    }
    
    try:
        # Read existing records
        records = []
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    records = json.loads(content)
        
        # Append new record at the beginning (newest first)
        records.insert(0, email_record)
        
        with open(LOG_FILE, "w") as f:
            json.dump(records, f, indent=2)
    except Exception as e:
        print(f"Error writing mock email log: {e}")

    # 2. Print to console
    print("\n" + "="*50)
    print(f" [MOCK EMAIL SENT] ")
    print(f" Timestamp: {timestamp}")
    print(f" To:        {to_email}")
    print(f" Subject:   {subject}")
    print(f" Body:\n{body}")
    print("="*50 + "\n")

    # 3. Attempt SMTP send if credentials are set
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = os.environ.get("SMTP_PORT")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASSWORD")
    
    if smtp_host and smtp_port and smtp_user and smtp_pass:
        try:
            msg = MIMEText(body, "html" if "<html" in body.lower() else "plain")
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = to_email
            
            with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, [to_email], msg.as_string())
            print(f"Real email successfully sent to {to_email} via SMTP.")
        except Exception as e:
            print(f"Failed to send email via SMTP: {e}")

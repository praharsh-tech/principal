// components/emailService.js

export function sendTaskEmail({
  to_name,
  to_email,
  task_title,
  task_nature,
  task_deadline,
  from_name
}) {
  return emailjs.send("service_s56fino", "template_t43at3r", {
    to_name,
    to_email,
    task_title,
    task_nature,
    task_deadline,
    from_name
  });
}

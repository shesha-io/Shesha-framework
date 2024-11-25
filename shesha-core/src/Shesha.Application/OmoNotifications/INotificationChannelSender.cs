﻿using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.Notifications.Dto;
using Shesha.OmoNotifications.Configuration.Email;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications
{
    public interface INotificationChannelSender
    {
        string GetRecipientId(Person person);
        Task<bool> SendAsync(Person fromPerson, Person toPerson, OmoNotificationMessage message, bool isBodyHtml, string cc, bool throwException = false, List<EmailAttachment> attachments = null);
        Task<bool> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment> attachments = null);
    }
}

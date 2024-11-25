﻿using Abp.BackgroundJobs;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.OmoNotifications.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications.Jobs
{
    public class DirectNotificationJobQueuer : AsyncBackgroundJob<DirectNotificationJobArgs>, ITransientDependency
    {  
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<OmoNotificationMessage, Guid> _notificationMessage;
        private readonly IEnumerable<INotificationChannelSender> _channelSenders;


        public DirectNotificationJobQueuer(IRepository<Person, Guid> personRepository, IRepository<OmoNotificationMessage, Guid> notificationMessage, IEnumerable<INotificationChannelSender> channelSenders)
        {
            _notificationMessage = notificationMessage;
            _personRepository = personRepository;
            _channelSenders = channelSenders;

        }

        [UnitOfWork]
        public override async Task ExecuteAsync(DirectNotificationJobArgs args)
        {
            var fromPerson = await _personRepository.GetAsync(args.FromPerson);
            var toPerson = await _personRepository.GetAsync(args.ToPerson);
            var notificationMessage = await _notificationMessage.GetAsync(args.Message);
            var senderChannelInterface = _channelSenders.FirstOrDefault(x => x.GetType().Name == args.SenderTypeName);
            if (senderChannelInterface == null)
                throw new Exception($"No sender found for sender type: {args.SenderTypeName}");
            var sender = new NotificationSender(senderChannelInterface);
            await sender.SendAsync(fromPerson, toPerson, notificationMessage, true);
        }
    }
}

﻿using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using FluentValidation;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(FriendlyName = "Notification")]
    public class Notification : FullAuditedEntity<Guid>
    {
        [NotMapped]
        public virtual string FullName => !string.IsNullOrEmpty(Namespace) ? Namespace + ": " + Name : !string.IsNullOrEmpty(Name) ? Name : Id.ToString();

        [Required]
        [StringLength(255)]
        [EntityDisplayName]
        public virtual string Name { get; set; }

        [StringLength(255)]
        public virtual string Namespace { get; set; }

        [DataType(DataType.MultilineText)]
        [StringLength(int.MaxValue)]
        public virtual string Description { get; set; }
    }

    public class NotificationValidator : AbstractValidator<Notification>
    {
        private readonly IRepository<Notification, Guid> _repository;

        public NotificationValidator(IRepository<Notification, Guid> repository)
        {
            _repository = repository;
            RuleFor(x => x.Name).NotEmpty().MustAsync(UniqueNameAsync).WithMessage("Notification with name '{PropertyValue}' already exists.");
        }

        private async Task<bool> UniqueNameAsync(Notification notification, string name, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(name))
                return true;

            var alreadyExist = await _repository.GetAll().Where(m => m.Name.ToLower() == name.ToLower() && m.Id != notification.Id).AnyAsync();
            return !alreadyExist;
        }
    }

}

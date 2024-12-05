﻿using Abp;
using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Modules;
using Abp.Net.Mail;
using Abp.Net.Mail.Smtp;
using Abp.Notifications;
using Abp.Reflection;
using Abp.Reflection.Extensions;
using Castle.MicroKernel.Registration;
using Shesha.Authorization;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Email;
using Shesha.GraphQL;
using Shesha.Modules;
using Shesha.Notifications;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Configuration.Email;
using Shesha.Notifications.Configuration.Email.Gateways;
using Shesha.Notifications.Configuration.Sms;
using Shesha.Notifications.Distribution.NotificationChannels;
using Shesha.Notifications.Distribution.NotificationGateways;
using Shesha.Notifications.Distribution.NotificationTypes;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Reflection;
using Shesha.Settings.Ioc;
using Shesha.Sms;
using Shesha.Sms.Configuration;
using Shesha.Startup;
using Shesha.UserManagements.Configurations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha
{
    [DependsOn(
        typeof(AbpKernelModule),
        typeof(SheshaCoreModule),
        typeof(SheshaGraphQLModule),
        typeof(AbpAutoMapperModule),
        typeof(AbpAspNetCoreModule))]
    public class SheshaApplicationModule : SheshaSubModule<SheshaFrameworkModule>
    {
        public const int DefaultSingleMessageMaxLength = 160;
        public const int DefaultMessagePartLength = 153;
        public override async Task<bool> InitializeConfigurationAsync()
        {
            return await ImportConfigurationAsync();
        }

        public override void PreInitialize()
        {
            // disable API audit by default
            Configuration.Auditing.IsEnabled = false;

            IocManager.Register<IShaApplicationModuleConfiguration, ShaApplicationModuleConfiguration>();
            IocManager.Register<INotificationSender, NotificationSender>();

            Configuration.Authorization.Providers.Add<SheshaAuthorizationProvider>();
            Configuration.Authorization.Providers.Add<DbAuthorizationProvider>();


            // replace email sender
            Configuration.ReplaceService<ISmtpEmailSenderConfiguration, SmtpEmailSenderSettings>(DependencyLifeStyle.Transient);

            // ToDo: migrate Notification to ABP 6.6.2
            //Configuration.Notifications.Distributers.Clear();
            //Configuration.Notifications.Distributers.Add<ShaNotificationDistributer>();

            IocManager.IocContainer.Register(
                Component.For<IEmailSender>().Forward<ISheshaEmailSender>().Forward<SheshaEmailSender>().ImplementedBy<SheshaEmailSender>().LifestyleTransient(),
                Component.For(typeof(IEntityReorderer<,,>)).ImplementedBy(typeof(EntityReorderer<,,>)).LifestyleTransient()
            );

            #region Notification Settings

            IocManager.RegisterSettingAccessor<INotificationSettings>(s => {
                s.NotificationSettings.WithDefaultValue(new NotificationSettings
                {
                    Low = new List<NotificationChannelConfig> { },
                    Medium = new List<NotificationChannelConfig> { },
                    High = new List<NotificationChannelConfig> { },
                });
                s.SmsSettings.WithDefaultValue(new Shesha.Notifications.Configuration.Sms.SmsSettings
                {
                    SmsEnabled = true,
                    PreferredGateway = null
                });
                s.EmailSettings.WithDefaultValue(new Shesha.Notifications.Configuration.Email.EmailSettings
                {
                    EmailsEnabled = true,
                    PreferredGateway = null
                });
            });

            IocManager.RegisterSettingAccessor<IEmailGatewaySettings>(s => {
                s.SmtpSettings.WithDefaultValue(new SmtpSettings
                {
                    Port = 25,
                    UseSmtpRelay = false,
                    EnableSsl = false,
                });
            });

            IocManager.RegisterSettingAccessor<ISmsGatewaySettings>(s => {
                s.ClickatellSettings.WithDefaultValue(new Notifications.Configuration.Sms.Gateways.ClickatellSettings
                {
                    Host = "api.clickatell.com",
                    SingleMessageMaxLength = DefaultSingleMessageMaxLength,
                    MessagePartLength = DefaultMessagePartLength
                });
            });

            #endregion

            #region SMS Gateways

            IocManager.RegisterSettingAccessor<ISmsSettings>(s => {
                s.SmsSettings.WithDefaultValue(new Shesha.Sms.Configuration.SmsSettings
                {
                    SmsGateway = NullSmsGateway.Uid
                });
            });



            IocManager.Register<NullSmsGateway, NullSmsGateway>(DependencyLifeStyle.Transient);

            IocManager.IocContainer.Register(
                Component.For<ISmsGateway>().UsingFactoryMethod(f =>
                {
                    var settings = f.Resolve<ISmsSettings>();
                    var gatewayUid = settings.SmsSettings.GetValue().SmsGateway;

                    var gatewayType = !string.IsNullOrWhiteSpace(gatewayUid)
                        ? f.Resolve<ITypeFinder>().Find(t => typeof(ISmsGateway).IsAssignableFrom(t) && t.GetClassUid() == gatewayUid).FirstOrDefault()
                        : null;

                    var gateway = gatewayType != null
                        ? f.Resolve(gatewayType) as ISmsGateway
                        : null;

                    return gateway ?? new NullSmsGateway();
                }, managedExternally: true).LifestyleTransient()
            );

            #endregion

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaApplicationModule).GetAssembly()
                 );
        }

        public override void Initialize()
        {
            IocManager.RegisterSettingAccessor<IOtpSettings>(s => {
                s.OneTimePins.WithDefaultValue(new OtpSettings
                {
                    Alphabet = OtpDefaults.DefaultAlphabet,
                    PasswordLength = OtpDefaults.DefaultPasswordLength,
                    DefaultLifetime = OtpDefaults.DefaultLifetime,
                    DefaultSubjectTemplate = OtpDefaults.DefaultSubjectTemplate,
                    DefaultBodyTemplate = OtpDefaults.DefaultBodyTemplate,
                    DefaultEmailSubjectTemplate = OtpDefaults.DefaultEmailSubjectTemplate,
                    DefaultEmailBodyTemplate = OtpDefaults.DefaultEmailBodyTemplate
                });
            });

            IocManager.RegisterSettingAccessor<IUserManagementSettings>(s => {
                s.UserManagementSettings.WithDefaultValue(new UserManagementSettings
                {
                   SupportedRegistrationMethods = SupportedRegistrationMethods.MobileNumber,
                   GoToUrlAfterRegistration = "/",
                   UserEmailAsUsername = false,
                   AdditionalRegistrationInfo = false,
                   AdditionalRegistrationInfoFormModule = null,
                   AdditionalRegistrationInfoFormName = null
                });
            });

            IocManager.Register<ISheshaAuthorizationHelper, ApiAuthorizationHelper>(DependencyLifeStyle.Transient);
            IocManager.Register<ISheshaAuthorizationHelper, EntityCrudAuthorizationHelper>(DependencyLifeStyle.Transient);

            var thisAssembly = Assembly.GetExecutingAssembly();
            IocManager.RegisterAssemblyByConvention(thisAssembly);

            IocManager.IocContainer.Register(Component
                        .For<IConfigurableItemExport>()
                        .Named("NotificationChannelExport")
                        .Forward<IConfigurableItemExport<NotificationChannelConfig>>()
                        .Forward<INotificationChannelExport>()
                        .ImplementedBy<NotificationChannelExport>()
                        .LifestyleTransient())
                                  .Register(Component
                        .For<IConfigurableItemImport>()
                        .Named("NotificationChannelImport")
                        .Forward<IConfigurableItemImport<NotificationChannelConfig>>()
                        .Forward<INotificationChannelImport>()
                        .ImplementedBy<NotificationChannelImport>()
                        .LifestyleTransient())
                                  .Register(Component
                        .For<IConfigurableItemExport>()
                        .Named("NotificationTypeExport")
                        .Forward<IConfigurableItemExport<NotificationTypeConfig>>()
                        .Forward<INotificationTypeExport>()
                        .ImplementedBy<NotificationTypeExport>()
                        .LifestyleTransient())
                                  .Register(Component
                        .For<IConfigurableItemImport>()
                        .Named("NotificationTypeImport")
                        .Forward<IConfigurableItemImport<NotificationTypeConfig>>()
                        .Forward<INotificationTypeImport>()
                        .ImplementedBy<NotificationTypeImport>()
                        .LifestyleTransient())
                                  .Register(Component
                        .For<IConfigurableItemExport>()
                        .Named("NotificationGatewayExport")
                        .Forward<IConfigurableItemExport<NotificationGatewayConfig>>()
                        .Forward<INotificationGatewayExport>()
                        .ImplementedBy<NotificationGatewayExport>()
                        .LifestyleTransient())
                                  .Register(Component
                        .For<IConfigurableItemImport>()
                        .Named("NotificationGatewayImport")
                        .Forward<IConfigurableItemImport<NotificationGatewayConfig>>()
                        .Forward<INotificationGatewayImport>()
                        .ImplementedBy<NotificationGatewayImport>()
                        .LifestyleTransient());


            /* api not used now, this registration causes problems in the IoC. Need to solve IoC problem before uncommenting
            var schemaContainer = IocManager.Resolve<ISchemaContainer>();
            var serviceProvider = IocManager.Resolve<IServiceProvider>();
            schemaContainer.RegisterCustomSchema("api", new ApiSchema(serviceProvider));
            */

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}

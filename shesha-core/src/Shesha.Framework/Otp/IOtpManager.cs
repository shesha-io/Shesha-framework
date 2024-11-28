﻿using Shesha.Otp.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public interface IOtpManager
    {
        /// <summary>
        /// Send one-time-pin
        /// </summary>
        Task<ISendPinResponse> SendPinAsync(ISendPinInput input);

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        Task<ISendPinResponse> ResendPinAsync(IResendPinInput input);

        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        Task<IVerifyPinResponse> VerifyPinAsync(IVerifyPinInput input);

        /// <summary>
        /// Get OTP
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns></returns>
        Task<IOtpDto> GetAsync(Guid operationId);
    }
}

﻿using System.Threading.Tasks;

namespace OrionApi.Services.Communities
{
    public interface ICommunityService
    {
        public Task<string> Create(string title, string description, string userId);
    }
}

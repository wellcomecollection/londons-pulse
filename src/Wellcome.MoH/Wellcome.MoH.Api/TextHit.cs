using System;

namespace Wellcome.MoH.Api
{
    [Serializable]
    public class TextHit : Hit
    {
        public string Extract { get; set; }
    }
}
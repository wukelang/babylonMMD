////////////////////////////////////////////////////////////////////////////////////////////////
// 
////////////////////////////////////////////////////////////////////////////////////////////////

// �g�p����CLUT�̖����B1,2,4�̂ǂꂩ
#define USE_CLUT_NUM	1

#define ClutTexName1	"clut_y.png"
//#define ClutTexName1	"clut_retro1.png"
//#define ClutTexName1	"clut_retro2.png"
//#define ClutTexName1	"clut_retro3.png"
//#define ClutTexName1	"clut_bluegray.png"
//#define ClutTexName1	"clut_orange.png"
//#define ClutTexName1	"clut_gold.png"


//#define ClutTexName1	"clut_tintblue.png"
//#define ClutTexName2	"clut_bleachBypass.png"
//#define ClutTexName3	"clut_yellowpurple.png"
//#define ClutTexName1	"clut_green.png"
//#define ClutTexName1	"clut_darkpurple.png"

//#define ClutTexName1	"clut_vivid.png"



/*
CLUT(Color LookUp Table)��1�̏ꍇ�́AClutTexName1�Ŏw�肵��CLUT�݂̂��g���B

2�̏ꍇ�́AClutTexName1��ClutTexName2���g���A�A�N�Z�T����X�ŗ��҂̊������w�肷��B
X=0�̏ꍇ�́A1��100%�A2��0%�BX=0.5�̏ꍇ�͗��҂�50%�ƂȂ�B

4�̏ꍇ�́A�A�N�Z�T����X,Y�Ŋ������w�肷��B
X�ɉ����āAClutTexName1�� 2�̊����AClutTexName3�� 4�̊��������߁A
���҂̊�����Y�Ō��߂�BY=0�̏ꍇ�AClutTexName1��2��X�̒l�ō����������̂�100%�̊����Ŏg���B
X=0.3, Y=0.7�̂Ƃ��AClutTexName1,2,3,4�����ꂼ��21%, 9%, 49%, 21%�̊����ō����������̂ɂȂ�B
*/

//****************** �ȉ��́A�M��Ȃ��ق��������ݒ荀��

// �e�N�X�`���t�H�[�}�b�g
//#define TEXFORMAT "A32B32G32R32F"
//#define TEXFORMAT "A16B16G16R16F"
#define TEXFORMAT "A8R8G8B8"

#define ClutPixelSize	32


//****************** �ݒ�͂����܂�

float3 AcsPos : CONTROLOBJECT < string name = "(self)"; >;
float AcsTr : CONTROLOBJECT < string name = "(self)"; string item = "Tr"; >;

////////////////////////////////////////////////////////////////////////////////////////////////

float Script : STANDARDSGLOBAL <
	string ScriptOutput = "color";
	string ScriptClass = "scene";
	string ScriptOrder = "postprocess";
> = 0.8;

// ���[�N�p�e�N�X�`���̐ݒ�
#define FILTER_MODE			MinFilter = POINT; MagFilter = POINT; MipFilter = NONE;
#define LINEAR_FILTER_MODE	MinFilter = LINEAR; MagFilter = LINEAR; MipFilter = NONE;
#define ADDRESSING_MODE		AddressU = BORDER; AddressV = BORDER; BorderColor = float4(0,0,0,0);

// �����_�����O�^�[�Q�b�g�̃N���A�l
float4 ClearColor = {0,0,0,0};
float ClearDepth  = 1.0;

#define ScreenScale		1

// �X�N���[���T�C�Y
float2 ViewportSize : VIEWPORTPIXELSIZE;
static float2 ViewportOffset = (float2(0.5,0.5) /(ScreenScale * ViewportSize.xy));
static float2 SampleStep = (float2(1.0,1.0) / (ScreenScale * ViewportSize.xy));

texture2D ScnMap : RENDERCOLORTARGET <
	bool AntiAlias = false;
	float2 ViewportRatio = {ScreenScale, ScreenScale};
	int MipLevels = 1;
	string Format = TEXFORMAT;
>;

sampler2D ScnSamp = sampler_state {
	texture = <ScnMap>;
	FILTER_MODE
	ADDRESSING_MODE
};

texture2D DepthBuffer : RENDERDEPTHSTENCILTARGET <
	float2 ViewportRatio = {ScreenScale, ScreenScale};
	string Format = "D24S8";
>;

#define DECL_CLUT(map,samp,filename) \
	texture map < string ResourceName = filename; >; \
	sampler samp = sampler_state { \
		Texture = <map>; \
		ADDRESSU = CLAMP; ADDRESSV = CLAMP; \
		MAGFILTER = LINEAR; MINFILTER = LINEAR; MIPFILTER = NONE; \
	}

DECL_CLUT(ClutTex1, ClutSamp1, ClutTexName1);
#if USE_CLUT_NUM >= 2
DECL_CLUT(ClutTex2, ClutSamp2, ClutTexName2);
#if USE_CLUT_NUM >= 4
DECL_CLUT(ClutTex3, ClutSamp3, ClutTexName3);
DECL_CLUT(ClutTex4, ClutSamp4, ClutTexName4);
#endif
#endif


//-----------------------------------------------------------------------------
//

struct VS_OUTPUT {
	float4 Pos			: POSITION;
	float4 TexCoord		: TEXCOORD0;
};

VS_OUTPUT VS_SetTexCoord( float4 Pos : POSITION, float4 Tex : TEXCOORD0, uniform float level)
{
	VS_OUTPUT Out = (VS_OUTPUT)0; 

	Out.Pos = Pos;
	float2 TexCoord = Tex.xy + ViewportOffset.xy * level;
	float2 Offset = SampleStep * level;
	Out.TexCoord = float4(TexCoord, Offset);
	return Out;
}


float4 PS_Final( VS_OUTPUT IN) : COLOR
{
	float4 col = saturate(tex2D(ScnSamp, IN.TexCoord.xy));

	const float scale = ((ClutPixelSize - 1.0) / ClutPixelSize);
	const float offset = (0.5 / ClutPixelSize);

	float3 uv = col.rrg * scale + offset;
	float b0 = col.b * (ClutPixelSize - 1.0);
	float b1 = min(floor(b0) + 1.0, (ClutPixelSize - 1.0));
	uv.xy = (uv.xy + float2(floor(b0), b1)) * (1.0 / ClutPixelSize);
	float t = saturate(b0 - floor(b0));

	float4 col0 = tex2Dlod(ClutSamp1, float4(uv.xz, 0, 0));
	float4 col1 = tex2Dlod(ClutSamp1, float4(uv.yz, 0, 0));
	float4 clut1 = lerp(col0, col1, t);

	#if USE_CLUT_NUM >= 2
	col0 = tex2Dlod(ClutSamp2, float4(uv.xz, 0, 0));
	col1 = tex2Dlod(ClutSamp2, float4(uv.yz, 0, 0));
	float4 clut2 = lerp(col0, col1, t);
	clut1 = lerp(clut1, clut2, saturate(AcsPos.x));
	#if USE_CLUT_NUM >= 4

	col0 = tex2Dlod(ClutSamp3, float4(uv.xz, 0, 0));
	col1 = tex2Dlod(ClutSamp3, float4(uv.yz, 0, 0));
	float4 clut3 = lerp(col0, col1, t);
	col0 = tex2Dlod(ClutSamp4, float4(uv.xz, 0, 0));
	col1 = tex2Dlod(ClutSamp4, float4(uv.yz, 0, 0));
	float4 clut4 = lerp(col0, col1, t);
	clut3 = lerp(clut3, clut4, saturate(AcsPos.x));
	clut1 = lerp(clut1, clut3, saturate(AcsPos.y));
	#endif
	#endif

	float4 result = lerp(col, clut1, AcsTr);

	return float4(result.rgb, col.a);
}

////////////////////////////////////////////////////////////////////////////////////////////////

technique ClutTech <
	string Script = 
		"RenderColorTarget0=ScnMap;"
		"RenderDepthStencilTarget=DepthBuffer;"
		"ClearSetColor=ClearColor;"
		"ClearSetDepth=ClearDepth;"
		"Clear=Color;"
		"Clear=Depth;"
		"ScriptExternal=Color;"

		"RenderColorTarget0=;"
		"RenderDepthStencilTarget=;"
		"Pass=FinalPass;"
	;
> {
	pass FinalPass < string Script= "Draw=Buffer;"; > {
		AlphaBlendEnable = FALSE;	AlphaTestEnable = FALSE;
		VertexShader = compile vs_3_0 VS_SetTexCoord(1);
		PixelShader  = compile ps_3_0 PS_Final();
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////



//Shadekai (Project Sekai shader for MMD)

#define SekaiMap_Texture "tex_body_H.png" //The texture that ends with "_H"
#define ShadowColorMap_Texture "tex_body_S.png" //The texture that ends with "_S"

#define Character 20
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//	0.Ichika	4.Minori	8.Kohane	12.Tsukasa	16.Kanade	20.Vocaloids
//	1.Saki		5.Haruka	9.An		13.Emu		17.Mafuyu
//	2.Honami	6.Airi		10.Akito	14.Nene		18.Ena
//	3.Shiho		7.Shizuku	11.Touya	15.Rui		19.Mizuki
//////////////////////////////////////////////////////////////////////////////////////////////////////////

#define Shadow 1
	//0 to disable, 1 to enable
	//If you choose 1, you have to load HgShadow.x for the model to have real-time shadow
	//Choose 0 if you don't want the model to have real-time shadow even when HgShadow.x is loaded
	//The model won't have real-time shadow regardless of the options if HgShadow.x is not loaded
	
#define Shadow_Sharp 1
	//0 to choose soft shadow , 1 to choose sharp shadow
	//For Sekai's artstyle, sharp shadow is recommended. And no, sharp not as in default MMD's busted pixelated shadow, it's Hgshadow but sharpened

float Rim_Intensity = 0.35;
float Rim_Length = 0.25; //SMALLER number means LONGER rim
float Rim_Thickness = 0.65; //SMALLER number means THICKER rim

float Edge_Thickness = 0.01;

#include "Shadekai_Sync.fxsub"
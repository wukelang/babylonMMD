import "babylon-mmd/esm/Loader/pmxLoader";
import "babylon-mmd/esm/Loader/Optimized/bpmxLoader";
import "@babylonjs/core/Materials/Textures/Loaders/tgaTextureLoader";

import type { Engine, Mesh} from "@babylonjs/core";
import { DirectionalLight, HavokPlugin, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShadowGenerator, Vector3 } from "@babylonjs/core";
// import { HavokPlugin, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import havokPhysics from "@babylonjs/havok";
import { MmdCamera, MmdPhysics, MmdPlayerControl, MmdRuntime, StreamAudioPlayer, VmdLoader } from "babylon-mmd";
import type { BpmxLoader } from "babylon-mmd/esm/Loader/Optimized/bpmxLoader";

import type { ISceneBuilder } from "./baseRuntime";

export class SceneBuilder implements ISceneBuilder {
    public async build(_canvas: HTMLCanvasElement, engine: Engine): Promise<Scene> {

        const bpmxLoader = SceneLoader.GetPluginForExtension(".bpmx") as BpmxLoader;
        bpmxLoader.loggingEnabled = true;
        // const materialBuilder = bpmxLoader.materialBuilder as MmdStandardMaterialBuilder;
        // materialBuilder.loadOutlineRenderingProperties = (): void => { /* do nothing */ };

        const scene = new Scene(engine);

        const mmdCamera = new MmdCamera("mmdCamera", new Vector3(0, 10, -100), scene);
        // mmdCamera.maxZ = 300;
        // mmdCamera.minZ = 1;
        // mmdCamera.parent = mmdRoot;


        const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(0, 1, 0), scene);
        hemisphericLight.intensity = 0.3;
        hemisphericLight.specular.set(0, 0, 0);
        hemisphericLight.groundColor.set(1, 1, 1);

        const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0.5, -1, 1), scene);
        directionalLight.intensity = 0.7;
        directionalLight.shadowMaxZ = 20;
        directionalLight.shadowMinZ = -15;

        const shadowGenerator = new ShadowGenerator(2048, directionalLight, true);
        // shadowGenerator.usePercentageCloserFiltering = true;
        // shadowGenerator.forceBackFacesOnly = true;
        // shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
        // shadowGenerator.frustumEdgeFalloff = 0.1;

        const ground = MeshBuilder.CreateGround("ground1", { width: 1000, height: 1000, subdivisions: 10, updatable: false }, scene);
        ground.receiveShadows = true;
        shadowGenerator.addShadowCaster(ground);

        const stageMesh = await SceneLoader.ImportMeshAsync("", "res/57- Newly Edgy Idols/stage_057/", "stage_05out.pmx", scene)
            .then((result) => result.meshes[0] as Mesh);
        // stageMesh.receiveShadows = true;
        // shadowGenerator.addShadowCaster(stageMesh);

        const mikuMesh = await SceneLoader.ImportMeshAsync("", "res/MMJModels/MMJ Miku/", "SEKAI Bones Set.pmx", scene)
            .then((result) => result.meshes[0] as Mesh);
        mikuMesh.receiveShadows = true;
        shadowGenerator.addShadowCaster(mikuMesh);

        const minoriMesh = await SceneLoader.ImportMeshAsync("", "res/MMJModels/Hanasato Minori/", "SEKAI Bones Set.pmx", scene)
            .then((result) => result.meshes[0] as Mesh);
        minoriMesh.receiveShadows = true;
        shadowGenerator.addShadowCaster(minoriMesh);

        const shizukuMesh = await SceneLoader.ImportMeshAsync("", "res/MMJModels/Hinomori Shizuku/", "SEKAI Bones Set.pmx", scene)
            .then((result) => result.meshes[0] as Mesh);
        shizukuMesh.receiveShadows = true;
        shadowGenerator.addShadowCaster(shizukuMesh);

        const harukaMesh = await SceneLoader.ImportMeshAsync("", "res/MMJModels/Kiritani Haruka/", "SEKAI Bones Set.pmx", scene)
            .then((result) => result.meshes[0] as Mesh);
        harukaMesh.receiveShadows = true;
        shadowGenerator.addShadowCaster(harukaMesh);

        const airiMesh = await SceneLoader.ImportMeshAsync("", "res/MMJModels/Momoi Airi/", "SEKAI Bones Set.pmx", scene)
            .then((result) => result.meshes[0] as Mesh);
        airiMesh.receiveShadows = true;
        shadowGenerator.addShadowCaster(airiMesh);

        const vmdLoader = new VmdLoader(scene);
        const mikuMotion = await vmdLoader.loadAsync("dance", ["res/57- Newly Edgy Idols/Mot_Miku.vmd"]);
        const minoriMotion = await vmdLoader.loadAsync("dance", ["res/57- Newly Edgy Idols/Mot_Minori.vmd"]);
        const shizukuMotion = await vmdLoader.loadAsync("dance", ["res/57- Newly Edgy Idols/Mot_Shizuku.vmd"]);
        const harukaMotion = await vmdLoader.loadAsync("dance", ["res/57- Newly Edgy Idols/Mot_Haruka.vmd"]);
        const airiMotion = await vmdLoader.loadAsync("dance", ["res/57- Newly Edgy Idols/Mot_Airi.vmd"]);

        const mmdCameraMotion = await vmdLoader.loadAsync("camera_motion", [
            "res/57- Newly Edgy Idols/MainCamera.vmd"
            // "res/57- Newly Edgy Idols/Song_057_Cam.vmd"
        ]);

        const havokInstance = await havokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);
        // scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
        scene.enablePhysics(new Vector3(0, -16, 0), havokPlugin);

        const mmdRuntime = new MmdRuntime(new MmdPhysics(scene));
        mmdRuntime.register(scene);

        const audioPlayer = new StreamAudioPlayer(scene);
        audioPlayer.source = "res/57- Newly Edgy Idols/Song_057.wav";
        mmdRuntime.setAudioPlayer(audioPlayer);
        const mmdPlayerControl = new MmdPlayerControl(scene, mmdRuntime, audioPlayer);
        mmdPlayerControl.showPlayerControl();

        mmdRuntime.setCamera(mmdCamera);
        mmdCamera.addAnimation(mmdCameraMotion);
        mmdCamera.setAnimation("camera_motion");

        mmdRuntime.createMmdModel(stageMesh);

        const mikuModel = mmdRuntime.createMmdModel(mikuMesh);
        mikuModel.addAnimation(mikuMotion);
        mikuModel.setAnimation("dance");

        const minoriModel = mmdRuntime.createMmdModel(minoriMesh);
        minoriModel.addAnimation(minoriMotion);
        minoriModel.setAnimation("dance");

        const shizukuModel = mmdRuntime.createMmdModel(shizukuMesh);
        shizukuModel.addAnimation(shizukuMotion);
        shizukuModel.setAnimation("dance");

        const harukaModel = mmdRuntime.createMmdModel(harukaMesh);
        harukaModel.addAnimation(harukaMotion);
        harukaModel.setAnimation("dance");

        const airiModel = mmdRuntime.createMmdModel(airiMesh);
        airiModel.addAnimation(airiMotion);
        airiModel.setAnimation("dance");

        mmdRuntime.playAnimation();

        return scene;

    }
}

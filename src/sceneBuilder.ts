import "babylon-mmd/esm/Loader/pmxLoader";

import type { Engine, Mesh} from "@babylonjs/core";
import { DirectionalLight, HavokPlugin, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShadowGenerator, Vector3 } from "@babylonjs/core";
import havokPhysics from "@babylonjs/havok";
import { MmdCamera, MmdPhysics, MmdRuntime, VmdLoader } from "babylon-mmd";

import type { ISceneBuilder } from "./baseRuntime";

export class SceneBuilder implements ISceneBuilder {
    public async build(_canvas: HTMLCanvasElement, engine: Engine): Promise<Scene> {
        const scene = new Scene(engine);

        const mmdCamera = new MmdCamera("mmdCamera", new Vector3(0, 10, 0), scene);


        const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(0, 1, 0), scene);
        hemisphericLight.intensity = 0.3;
        hemisphericLight.specular.set(0, 0, 0);
        hemisphericLight.groundColor.set(1, 1, 1);

        const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0.5, -1, 1), scene);
        directionalLight.intensity = 0.7;
        directionalLight.shadowMaxZ = 20;
        directionalLight.shadowMinZ = -15;

        const shadowGenerator = new ShadowGenerator(2048, directionalLight, true, mmdCamera);
        shadowGenerator.bias = 0.01;

        const ground = MeshBuilder.CreateGround("ground1", { width: 60, height: 60, subdivisions: 2, updatable: false }, scene);
        ground.receiveShadows = true;
        shadowGenerator.addShadowCaster(ground);

        // const mmdMesh = await SceneLoader.ImportMeshAsync("", "res/MMJModels/MMJ Miku/", "SEKAI Bones Set.pmx", scene)
        //     .then((result) => result.meshes[0]);
        const mmdMesh = await SceneLoader.ImportMeshAsync("", "res/VBS_Models/Miku_9001/", "29_9001.pmx", scene)
        // const mmdMesh = await SceneLoader.ImportMeshAsync("", "res/VBS_Models/", "MikuV3.bpmx", scene)
            .then((result) => result.meshes[0] as Mesh);
        mmdMesh.receiveShadows = true;
        shadowGenerator.addShadowCaster(mmdMesh);

        const vmdLoader = new VmdLoader(scene);
        const motion = await vmdLoader.loadAsync("miku_motion", [
            "res/Beyond the way/Motion_Miku.vmd"
        ]);

        const mmdCameraMotion = await vmdLoader.loadAsync("camera_motion", [
            "res/Beyond the way/Camera.vmd"
        ]);

        const havokInstance = await havokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);
        scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

        const mmdRuntime = new MmdRuntime(new MmdPhysics(scene));
        mmdRuntime.register(scene);

        mmdRuntime.setCamera(mmdCamera);
        mmdCamera.addAnimation(mmdCameraMotion);
        mmdCamera.setAnimation("camera_motion");

        const mmdModel = mmdRuntime.createMmdModel(mmdMesh);
        mmdModel.addAnimation(motion);
        mmdModel.setAnimation("miku_motion");

        mmdRuntime.playAnimation();

        return scene;

    }
}

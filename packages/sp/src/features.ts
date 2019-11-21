import { SharePointQueryableInstance, SharePointQueryableCollection, defaultPath } from "./sharepointqueryable";
import { jsS } from "@pnp/common";

/**
 * Describes a collection of List objects
 *
 */
@defaultPath("features")
export class Features extends SharePointQueryableCollection {

    /**
     * Adds a new list to the collection
     *
     * @param id The Id of the feature (GUID)
     * @param force If true the feature activation will be forced
     */
    public add(id: string, force = false): Promise<FeatureAddResult> {

        return this.clone(Features, "add").postCore({
            body: jsS({
                featdefScope: 0,
                featureId: id,
                force: force,
            }),
        }).then(data => {
            return {
                data: data,
                feature: this.getById(id),
            };
        });
    }

    /**	    
     * Gets a list from the collection by guid id	     
     *	    
     * @param id The Id of the feature (GUID)	    
     */
    public getById(id: string): Feature {
        const feature = new Feature(this);
        feature.concat(`('${id}')`);
        return feature;
    }

    /**
     * Removes (deactivates) a feature from the collection
     *
     * @param id The Id of the feature (GUID)
     * @param force If true the feature deactivation will be forced
     */
    public remove(id: string, force = false): Promise<any> {

        return this.clone(Features, "remove").postCore({
            body: jsS({
                featureId: id,
                force: force,
            }),
        });
    }
}

export class Feature extends SharePointQueryableInstance {

    /**
     * Removes (deactivates) a feature from the collection
     *
     * @param force If true the feature deactivation will be forced
     */
    public deactivate(force = false): Promise<any> {

        const removeDependency = this.addBatchDependency();

        const idGet = new Feature(this).select("DefinitionId");

        return idGet.get<{ DefinitionId: string }>().then(feature => {

            const promise = this.getParent(Features, this.parentUrl, "", this.batch).remove(feature.DefinitionId, force);

            removeDependency();

            return promise;
        });
    }
}

export interface FeatureAddResult {
    data: any;
    feature: Feature;
}

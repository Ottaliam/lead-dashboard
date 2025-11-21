import geopandas as gpd

INPUT_GEOJSON = "mi_cwb.geojson"
OUTPUT_GEOJSON = "mi_cwb_centroids.geojson"

def main():
    print("Starting script...")
    print(f"Loading polygons from {INPUT_GEOJSON}...")
    gdf = gpd.read_file(INPUT_GEOJSON)
    print("Read", len(gdf), "features")

    if gdf.crs is None:
        print("No CRS found; assuming EPSG:4326")
        gdf.set_crs(epsg=4326, inplace=True)
    else:
        print("CRS is", gdf.crs)

    print("Computing centroids...")
    centroids = gdf.geometry.centroid

    gdf_points = gdf.copy()
    gdf_points["geometry"] = centroids

    print("Adding lon/lat fields...")
    gdf_points["lon"] = gdf_points.geometry.x
    gdf_points["lat"] = gdf_points.geometry.y

    print(f"Saving centroid points to {OUTPUT_GEOJSON}...")
    gdf_points.to_file(OUTPUT_GEOJSON, driver="GeoJSON")
    print("Done.")

if __name__ == "__main__":
    main()



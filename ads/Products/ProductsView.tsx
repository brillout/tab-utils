import "./ProductsView.css";
import React from "react";
import { scrollToElement } from "../../../tab-utils/pretty_scroll_area";
import { get_product_slots } from "../../load_ad";

export { enable_products_view };

export { ProductsView };

function ProductsView({ ad_slots }) {
  const product_slots = get_product_slots(ad_slots);
  return (
    <div
      id="products-section"
      style={{ display: "none" }}
      className="more_panel_block"
    >
      <div className="more_panel_block_title">Products</div>
      <div id="product-list">
        {product_slots.map((product_info: any) => (
          <ProductView {...product_info} />
        ))}
      </div>
    </div>
  );
}

function ProductView({
  product_link,
  product_text,
  product_name,
  amazon_banner,
}) {
  return (
    <div click-name={product_name} style={{ width: 250 }}>
      <div>
        <ul style={{ paddingLeft: 20, minHeight: 54 }}>
          <li>{product_text}</li>
        </ul>
      </div>
      <div
        style={{
          display: "flex",
          height: 254,
          width: 250,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
        dangerouslySetInnerHTML={{ __html: amazon_banner }}
      />
      <a className="product-link" href={product_link} target="_blank"></a>
    </div>
  );
}

function enable_products_view() {
  const products_section = document.querySelector("#products-section");
  (products_section as HTMLElement).style.display = "";

  (document.querySelector("#custom-banner") as HTMLElement).onclick = () => {
    scrollToElement(products_section);
  };
}

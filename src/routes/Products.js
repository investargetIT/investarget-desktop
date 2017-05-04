import React from 'react';
import { connect } from 'dva';
import ProductList from '../components/ProductList';
import MainLayout from '../components/MainLayout/MainLayout'

const Products = ({ dispatch, products, location }) => {
  function handleDelete(id) {
    dispatch({
      type: 'products/delete',
      payload: id,
    });
  }
  return (
    <MainLayout location={location}>
    <div>
      <h2>List of Products</h2>
      <ProductList onDelete={handleDelete} products={products} />
    </div>
  </MainLayout>
  );
};

// export default Products;
export default connect(({ products }) => ({
  products,
}))(Products);

import React from 'react';
import styles from './InvestorList.css';
import InvestorListComponent from '../components/InvestorList';
import MainLayout from '../components/MainLayout';

function InvestorList({ location }) {
  return (
    <MainLayout location={location}>
      <div className={styles.normal}>
        <InvestorListComponent />
      </div>
    </MainLayout>
  );
}



export default InvestorList;

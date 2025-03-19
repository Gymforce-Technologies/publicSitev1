"use client";
import CartProduct from "@/app/shared/ecommerce/cart/cart-product-2";
import CustomerInfo from "@/app/shared/ecommerce/order/order-form/customer-info";
import { FormProvider, useForm } from "react-hook-form";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Drawer,
  Empty,
  EmptyProductBoxIcon,
  Input,
  Loader,
  Text,
  Title,
  Tooltip,
} from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import {  useEffect, useRef, useState } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { XIcon } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";

interface Product {
  id: number;
  title: string;
  sell_price: number;
  image?: string;
  quantity?: number;
  description?: string;
}

interface OrderDetails {
  discount: string;
  paidAmount: string;
  dueAmount: string;
  dueDate: Date;
  paymentMode: any;
}

export default function CreateOrderPage() {
  const params = useSearchParams();
  const methods = useForm();
  const [showProducts, setShowProducts] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [showMembers, setShowMembers] = useState<boolean>(false);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [alert, setAlert] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  // const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    discount: "",
    paidAmount: "",
    dueAmount: "",
    dueDate: new Date(),
    paymentMode: null,
  });
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading2, setLoading2] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleSearch(searchText, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, memberList.length, currentMember, searchText, showMembers]);

  useEffect(() => {
    const total = selectedProducts.reduce((sum, product) => {
      return sum + product.sell_price * (product.quantity || 1);
    }, 0);
    setTotalPrice(total);
  }, [selectedProducts]);

  const getProducts = async () => {
    setLoading(true);
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/products/?center=${gymId}`,
        {
          id: `product-list`,
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
    // Trigger initial empty search
    handleSearch("", false, true);
    return () => {
      inputRef.current = null;
    };
  }, []);

  useEffect(() => {
    getProducts();
  }, []);

  const getMember = async (id: any) => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/member/${id}/basic/?gym_id=${gymId}`,
        {
          id: newID(`member-profile-${id}`),
        }
      );
      // console.log(resp.data);
      const memberData = resp.data.data;
      setCurrentMember(memberData);
      setSelectedMember(memberData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const newId = params.get("member")?.split("-")[1];
    if (newId) {
      getMember(newId);
    }
  }, [params]);

  const handleQuantityChange = (productId: number, quantity: number) => {
    // Ensure quantity is at least 1
    const safeQuantity = Math.max(1, quantity);

    setSelectedProducts(
      selectedProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: safeQuantity }
          : product
      )
    );
  };

  const handleSearchInputChange = (input: string) => {
    setSearchText(input);
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      handleSearch(input, false, true);
    }, 1000);

    setTimeoutId(newTimeoutId);
  };

  const handleSearch = async (
    searchInput: string,
    isLoadMore: boolean,
    load = false
  ) => {
    try {
      if (load) {
        setLoading2(true);
      }
      if (!isLoadMore || load) {
        setOffset(0);
      }
      // Use the current offset state value directly
      const currentOffset = isLoadMore ? offset : 0;
      const gymid = await retrieveGymId();

      const response = await AxiosPrivate.post(
        `/api/member_search/v2/?gym_id=${gymid}`,
        {
          filterString: searchInput,
          limit: LIMIT,
          offset: currentOffset,
        }
      );

      const newMembers = response.data.data.memberList;
      const totalCount = response.data.data.totalCount;

      // Use functional updates to ensure we have the latest state
      setMemberList((prevList) =>
        isLoadMore ? [...prevList, ...newMembers] : newMembers
      );

      // Calculate if there are more items to load
      const newTotalCount = isLoadMore
        ? memberList.length + newMembers.length
        : newMembers.length;

      setHasMore(newTotalCount < totalCount);

      // Update offset only after data is loaded
      setOffset(isLoadMore ? currentOffset + LIMIT : LIMIT);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading2(false);
    }
  };

  const handleSelect = (data: any) => {
    setCurrentMember(data);
    setSearchText("");
    setMemberList([]);
    setTimeout(() => handleSearch("", false, true), 300);
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== productId)
    );
  };

  // const handleSearch = async (searchInput: string) => {
  //   if (searchInput.trim() === "") {
  //     setMemberList([]);
  //     return;
  //   }
  //   try {
  //     setLoading(true);
  //     const gymid = await retrieveGymId();
  //     const response = await AxiosPrivate.post(
  //       `/api/member_search/?gym_id=${gymid}`,
  //       { filterString: searchInput },
  //       {
  //         id: newID(`search-members-${searchInput}`),
  //       }
  //     );
  //     setMemberList(response.data.data.memberList);
  //   } catch (error) {
  //     toast.error(
  //       "Something went wrong while searching members. Please try again."
  //     );
  //     console.error("Search error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmitOrder = async () => {
    if (!selectedMember) {
      toast.error("Please select a member");
      return;
    }

    if (!selectedProducts.length) {
      toast.error("Please add products to order");
      return;
    }

    try {
      const gymId = await retrieveGymId();
      const orderData = {
        member: selectedMember.id,
        total_price: totalPrice,
        discount: orderDetails.discount || `0.0`,
        paid_amount: orderDetails.paidAmount,
        due_amount: orderDetails.dueAmount,
        due_date: dayjs(orderDetails.dueDate).format("YYYY-MM-DD"),
        payment_mode: orderDetails.paymentMode?.value,
        sold_by: gymId,
        center: gymId,
        order_items: selectedProducts.map((product) => ({
          product: product.id,
          quantity: product.quantity || 1,
          price_per_unit: product.sell_price,
        })),
      };

      const response = await AxiosPrivate.post(
        `/api/orders/create/?gym_id=${gymId}`,
        orderData
      );
      toast.success("Order created successfully");
      // Reset form
      invalidateAll();
      setSelectedProducts([]);
      setSelectedMember(null);
      setOrderDetails({
        discount: "",
        paidAmount: "",
        dueAmount: "",
        dueDate: new Date(),
        paymentMode: null,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order");
    }
  };

  const isProductSelected = (productId: number) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  return (
    <>
      <Title as="h3" className="mx-4">
        Create Order
      </Title>
      <div className="w-full grid grid-cols-[60%,40%] gap-6 p-6 lg:p-8">
        <WidgetCard title="Products" className="grid grid-cols-1 gap-4">
          {selectedProducts.length ? (
            selectedProducts.map((item) => (
              <CartProduct
                key={item.id}
                product={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveProduct}
              />
            ))
          ) : (
            <Empty
              image={<EmptyProductBoxIcon />}
              text="No Product in the Cart"
            />
          )}
          <Button onClick={() => setShowProducts(true)}>Add Item</Button>
        </WidgetCard>
        <FormProvider {...methods}>
          <CustomerInfo
            currentMember={selectedMember}
            setShowMembers={setShowMembers}
            orderDetails={orderDetails}
            setOrderDetails={setOrderDetails}
            totalPrice={totalPrice}
            onSubmit={handleSubmitOrder}
          />
        </FormProvider>
      </div>

      {/* Products Drawer */}
      <Drawer
        isOpen={showProducts}
        onClose={() => setShowProducts(false)}
        containerClassName="p-4 lg:p-6"
      >
        {loading ? (
          <div className="w-full flex items-center justify-center my-4">
            <Loader variant="spinner" />
          </div>
        ) : products.length ? (
          <div className="space-y-4">
            {products.map((product) => {
              const isSelected = isProductSelected(product.id);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border-b border-gray-300 hover:scale-105 duration-150"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={product.image}
                      name={product.title}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <div>
                      <Title as="h6">{product.title}</Title>
                      <p>{product.description}</p>
                    </div>
                  </div>
                  <Tooltip
                    content={
                      isSelected ? "Product already added" : "Add to order"
                    }
                  >
                    <Button
                      className="scale-95"
                      disabled={isSelected}
                      onClick={() => {
                        if (!isSelected) {
                          setSelectedProducts([
                            ...selectedProducts,
                            { ...product, quantity: 1 },
                          ]);
                          toast.success("Product Added to Cart");
                          setShowProducts(false);
                        }
                      }}
                    >
                      {isSelected ? "Added" : "Choose"}
                    </Button>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty image={<EmptyProductBoxIcon />} text="No Product" />
        )}
      </Drawer>

      {/* Members Drawer */}
      <Drawer
        isOpen={showMembers}
        onClose={() => {
          setSearchText("");
          setShowMembers(false);
          setMemberList([]);
          setShowMembers(false);
          setCurrentMember(null);
          // setTimeout(() => , 500);
          handleSearch("", false, true);
        }}
        size="lg"
        className="z-[99999]"
        containerClassName="p-4 space-y-4"
      >
        <div className="relative">
          <Input
            value={searchText}
            ref={inputRef}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder={
              currentMember === null
                ? "Search Members to Assign Order"
                : "Clear Selected Member to Search"
            }
            prefix={
              <PiMagnifyingGlassBold className="text-gray-600" size={20} />
            }
            onFocus={() => {
              searchText.length === 0 && handleSearch("", false, true);
            }}
            disabled={currentMember !== null}
            suffix={
              searchText && (
                <Button
                  size="sm"
                  variant="text"
                  onClick={() => {
                    setSearchText("");
                    setMemberList([]);
                    setCurrentMember(null);
                    setShowMembers(false);
                    setTimeout(() => handleSearch("", false, true), 300);
                  }}
                >
                  <XIcon />
                </Button>
              )
            }
          />
          {currentMember === null && (
            <div className="absolute transition-all duration-200 overflow-y-auto max-h-[85vh] custom-scrollbar top-full left-0 z-[9999999999] flex w-full border-2 shadow rounded-lg p-4 py-8 mt-4 gap-2 flex-col items-stretch bg-gray-50 ">
              {loading || loading2 ? (
                <div className="flex justify-center items-center w-full my-4">
                  <Loader variant="spinner" size="xl" />
                </div>
              ) : memberList.length ? (
                memberList.map((item, index) => {
                  const isSecondToLast = index === memberList.length - 2;
                  return (
                    <div
                      ref={isSecondToLast && hasMore ? observerRef : null}
                      className="flex relative items-center gap-2.5 p-2 rounded cursor-pointer hover:bg-gray-100 hover:scale-y-105 group"
                      key={index}
                      onClick={() => {
                        if (item.status === "expired") {
                          setAlert({
                            message: "Expired Member.",
                            type: "danger",
                          });
                          setTimeout(() => {
                            setAlert(null);
                          }, 1000);
                          return;
                        }
                        handleSelect(item);
                      }}
                    >
                      <Avatar
                        name={item.name}
                        src={item.image || "/placeholder-avatar.jpg"}
                        className="text-white"
                      />
                      <div className="flex flex-col gap-2">
                        <Text className="font-medium text-gray-900  group-hover:text-gray-900">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 ">{item.phone}</Text>
                      </div>
                      <div className="flex items-center max-md:flex-col gap-8">
                        <Badge
                          variant="outline"
                          className="max-sm:scale-90 text-nowrap"
                        >
                          {item.membership_details?.name || "N/A"}
                        </Badge>
                        <Badge
                          size="sm"
                          variant="outline"
                          color={
                            item.status === "active" ? "success" : "danger"
                          }
                          className="max-sm:absolute -top-4 capitalize"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="my-4">
                  <Empty text="No Members Found" />
                </div>
              )}
              {alert && (
                <Alert
                  color={alert.type}
                  variant="flat"
                  className="fixed bottom-4 right-4 mx-auto max-w-60"
                >
                  {alert.message}
                </Alert>
              )}
            </div>
          )}
        </div>
        <div className=" grid md:flex items-stretch gap-4 w-full border-2 rounded-lg shadow-sm relative">
          {currentMember && (
            <div className="p-4 grid grid-cols-[60%,40%] items-center gap-4 sm:gap-x-8 min-w-full">
              <div className="col-span-full">
                <XIcon
                  onClick={() => setCurrentMember(null)}
                  className="ml-[90%] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4">
                <Avatar
                  name={currentMember.name}
                  size="xl"
                  src={currentMember.image}
                />
                <div>
                  <Title as="h6">{currentMember.name}</Title>
                  <Text>{currentMember.phone}</Text>
                  <Badge variant="outline">
                    {currentMember.membership_details?.name}
                  </Badge>
                </div>
              </div>
              <div className="col-span-full">
                {alert && (
                  <Alert color={alert.type} variant="flat">
                    {alert.message}
                  </Alert>
                )}
              </div>
              <Button
                onClick={() => {
                  setShowMembers(false);
                  setSelectedMember(currentMember);
                  toast.success("Member Added");
                  setSearchText("");
                  setMemberList([]);
                  setCurrentMember(null);
                  setTimeout(() => handleSearch("", false, true), 300);
                }}
              >
                Choose
              </Button>
            </div>
          )}
        </div>{" "}
      </Drawer>
    </>
  );
}

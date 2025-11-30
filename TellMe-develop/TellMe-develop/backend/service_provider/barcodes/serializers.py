from rest_framework import serializers
from .models import (
    BarcodeOrder, CarDetail, HomeDetail, ElectronicDetail,
    Listing, Interest, ViolationReport
)


class CarDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarDetail
        exclude = ("id", "barcode_order")


class HomeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeDetail
        exclude = ("id", "barcode_order")


class ElectronicDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElectronicDetail
        exclude = ("id", "barcode_order")


class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = "__all__"


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = "__all__"


class ViolationReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViolationReport
        fields = "__all__"


class BarcodeOrderSerializer(serializers.ModelSerializer):
    car_detail = CarDetailSerializer(required=False)
    home_detail = HomeDetailSerializer(required=False)
    electronic_detail = ElectronicDetailSerializer(required=False)
    listings = ListingSerializer(many=True, read_only=True)

    class Meta:
        model = BarcodeOrder
        fields = "__all__"

        # 🔥 IMPORTANT — Payment fields backend-only
        read_only_fields = [
            "owner",
            "barcode_code",
            "created_at",
            "updated_at",
            "is_paid",
            "payment_id",
            "payment_status",
            "razorpay_order_id",   # ⭐ Added
        ]

    # ------------------------------------
    # CREATE (handles car/home/electronic)
    # ------------------------------------
    def create(self, validated_data):
        car_data = validated_data.pop("car_detail", None)
        home_data = validated_data.pop("home_detail", None)
        electronic_data = validated_data.pop("electronic_detail", None)

        order = BarcodeOrder.objects.create(**validated_data)

        if car_data:
            CarDetail.objects.create(barcode_order=order, **car_data)
        if home_data:
            HomeDetail.objects.create(barcode_order=order, **home_data)
        if electronic_data:
            ElectronicDetail.objects.create(barcode_order=order, **electronic_data)

        return order

    # ------------------------------------
    # UPDATE
    # ------------------------------------
    def update(self, instance, validated_data):
        car_data = validated_data.pop("car_detail", None)
        home_data = validated_data.pop("home_detail", None)
        electronic_data = validated_data.pop("electronic_detail", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if car_data:
            CarDetail.objects.update_or_create(barcode_order=instance, defaults=car_data)
        if home_data:
            HomeDetail.objects.update_or_create(barcode_order=instance, defaults=home_data)
        if electronic_data:
            ElectronicDetail.objects.update_or_create(barcode_order=instance, defaults=electronic_data)

        return instance
